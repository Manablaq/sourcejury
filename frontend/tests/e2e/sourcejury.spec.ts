import fs from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";

import {
  expect,
  test,
  type Page
} from "@playwright/test";

const E2E_ADDRESS =
  "0x1111111111111111111111111111111111111111";

const CONTRACT =
  "0x2E8968E2a47ED96dE89D83061190314d24719929";

function evidenceRoot() {
  const value =
    process.env.SOURCEJURY_P5_OUT;

  if (!value) {
    throw new Error(
      "SOURCEJURY_P5_OUT is required"
    );
  }

  return value;
}

function safeName(
  value: string
) {
  return value
    .replace(
      /[^a-z0-9]+/gi,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .toLowerCase();
}

function browserErrors(
  page: Page
) {
  const errors: string[] = [];

  page.on(
    "pageerror",
    (error) => {
      errors.push(
        `pageerror: ${error.message}`
      );
    }
  );

  page.on(
    "console",
    (message) => {
      if (
        message.type() ===
        "error"
      ) {
        errors.push(
          `console.error: ${message.text()}`
        );
      }
    }
  );

  return errors;
}

function isRecoverableGenLayerTransport(
  value: string
) {
  return (
    value.includes(
      "GenLayer RPC error (gen_call): Load failed"
    ) ||
    value.includes(
      "GenLayer RPC error (gen_call): Failed to fetch"
    ) ||
    value.includes(
      "Failed to load resource: The network connection was lost."
    ) ||
    value.includes(
      "GenLayer RPC error (gen_call): NetworkError when attempting to fetch resource."
    ) ||
    value.includes(
      "GenLayer RPC error (gen_call): Server busy: all 8 execution slots occupied, retry later"
    ) ||
    value.includes(
      "GenLayer RPC error (gen_call): Rate limit exceeded: 30 requests per minute"
    ) ||
    value.includes(
      "Failed to load resource: the server responded with a status of 429"
    )
  );
}

function unexpectedErrors(
  errors: string[]
) {
  return errors.filter(
    (value) =>
      !isRecoverableGenLayerTransport(
        value
      )
  );
}

function saveDiagnostics(
  projectName: string,
  testName: string,
  errors: string[]
) {
  const dir =
    path.join(
      evidenceRoot(),
      "browser-diagnostics"
    );

  fs.mkdirSync(
    dir,
    {
      recursive:
        true
    }
  );

  const recoverable =
    errors.filter(
      isRecoverableGenLayerTransport
    );

  const unexpected =
    unexpectedErrors(
      errors
    );

  fs.writeFileSync(
    path.join(
      dir,
      `${safeName(projectName)}-${safeName(testName)}.json`
    ),
    JSON.stringify(
      {
        project:
          projectName,
        test:
          testName,
        allErrors:
          errors,
        recoverableGenLayerTransportErrors:
          recoverable,
        unexpectedErrors:
          unexpected
      },
      null,
      2
    ) + "\n"
  );

  return {
    recoverable,
    unexpected
  };
}

async function saveA11y(
  page: Page,
  projectName: string,
  route: string
) {
  const result =
    await new AxeBuilder({
      page
    })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa"
      ])
      .analyze();

  const destination =
    path.join(
      evidenceRoot(),
      "accessibility",
      `${safeName(projectName)}-${safeName(route || "home")}.json`
    );

  fs.writeFileSync(
    destination,
    JSON.stringify(
      result,
      null,
      2
    ) + "\n"
  );

  const blocking =
    result.violations.filter(
      (item) =>
        item.impact ===
          "serious" ||
        item.impact ===
          "critical"
    );

  expect(
    blocking,
    JSON.stringify(
      blocking.map(
        (item) => ({
          id:
            item.id,
          impact:
            item.impact,
          description:
            item.description,
          nodes:
            item.nodes.map(
              (node) =>
                node.target
            )
        })
      ),
      null,
      2
    )
  ).toEqual([]);
}

async function installMockWallet(
  page: Page
) {
  await page.addInitScript(
    ({
      address,
      studioChainId
    }) => {
      const w =
        window as typeof window & {
          __sourcejuryE2E?: {
            getCalls:
              () => string[];
            setAccounts:
              (
                accounts:
                  string[]
              ) => void;
            getChainId:
              () => string;
          };
        };

      const calls:
        string[] =
        [];

      let accounts =
        [
          address
        ];

      let chainId =
        "0x1";

      const listeners =
        new Map<
          string,
          Set<
            (
              ...args:
                unknown[]
            ) => void
          >
        >();

      const emit = (
        event:
          string,
        ...args:
          unknown[]
      ) => {
        for (
          const listener of
          listeners.get(
            event
          ) ?? []
        ) {
          listener(
            ...args
          );
        }
      };

      const provider = {
        async request({
          method,
          params
        }: {
          method:
            string;
          params?:
            | unknown[]
            | Record<
                string,
                unknown
              >;
        }) {
          calls.push(
            method
          );

          switch (
            method
          ) {
            case "eth_requestAccounts":
            case "eth_accounts":
              return [
                ...accounts
              ];

            case "eth_chainId":
              return chainId;

            case "eth_getBalance":
              return "0xde0b6b3a7640000";

            case "wallet_switchEthereumChain": {
              const list =
                Array.isArray(
                  params
                )
                  ? params
                  : [];

              const requested =
                (
                  list[0] as
                    | {
                        chainId?:
                          string;
                      }
                    | undefined
                )?.chainId;

              if (
                requested !==
                studioChainId
              ) {
                const error =
                  new Error(
                    "Unknown mock chain"
                  ) as
                    Error & {
                      code?:
                        number;
                    };

                error.code =
                  4902;

                throw error;
              }

              chainId =
                studioChainId;

              emit(
                "chainChanged",
                chainId
              );

              return null;
            }

            case "wallet_addEthereumChain":
              return null;

            case "eth_sendTransaction":
            case "eth_sendRawTransaction":
            case "personal_sign":
            case "eth_sign":
            case "wallet_sendCalls": {
              const error =
                new Error(
                  "E2E wallet blocks signing and transaction submission."
                ) as
                  Error & {
                    code?:
                      number;
                  };

              error.code =
                4001;

              throw error;
            }

            default:
              throw new Error(
                `Unsupported E2E wallet method: ${method}`
              );
          }
        },

        on(
          event:
            string,
          listener:
            (
              ...args:
                unknown[]
            ) => void
        ) {
          const set =
            listeners.get(
              event
            ) ??
            new Set();

          set.add(
            listener
          );

          listeners.set(
            event,
            set
          );
        },

        removeListener(
          event:
            string,
          listener:
            (
              ...args:
                unknown[]
            ) => void
        ) {
          listeners
            .get(
              event
            )
            ?.delete(
              listener
            );
        }
      };

      window.addEventListener(
        "eip6963:requestProvider",
        () => {
          window.dispatchEvent(
            new CustomEvent(
              "eip6963:announceProvider",
              {
                detail: {
                  info: {
                    uuid:
                      "350670db-19fa-4704-a166-e52e178b59d2",
                    name:
                      "SourceJury E2E Wallet",
                    rdns:
                      "e2e.sourcejury"
                  },
                  provider
                }
              }
            )
          );
        }
      );

      w.__sourcejuryE2E = {
        getCalls:
          () => [
            ...calls
          ],

        setAccounts(
          nextAccounts:
            string[]
        ) {
          accounts =
            [
              ...nextAccounts
            ];

          emit(
            "accountsChanged",
            [
              ...accounts
            ]
          );
        },

        getChainId:
          () =>
            chainId
      };
    },
    {
      address:
        E2E_ADDRESS,
      studioChainId:
        "0xf22d"
    }
  );
}

async function coolDownStudioRpc(
  page: Page,
  label: string
) {
  const cooldownMs =
    65_000;

  console.log(
    `SOURCEJURY_RPC_COOLDOWN_BEGIN=${label}:${cooldownMs}`
  );

  await page.waitForTimeout(
    cooldownMs
  );

  console.log(
    `SOURCEJURY_RPC_COOLDOWN_END=${label}`
  );
}

async function eventually(
  attempts: number,
  operation:
    (
      attempt:
        number
    ) => Promise<void>
) {
  let last:
    unknown;

  for (
    let attempt = 1;
    attempt <= attempts;
    attempt += 1
  ) {
    try {
      await operation(
        attempt
      );

      return;
    } catch (
      error
    ) {
      last =
        error;

      if (
        attempt ===
        attempts
      ) {
        throw error;
      }
    }
  }

  throw last;
}

test.describe(
  "SourceJury browser certification",
  () => {
    test(
      "core routes render and satisfy serious/critical accessibility gate",
      async ({
        page,
        browserName
      }, testInfo) => {
        if (
          browserName ===
            "firefox" ||
          browserName ===
            "webkit"
        ) {
          await coolDownStudioRpc(
            page,
            `${browserName}-project-start`
          );
        }

        const errors =
          browserErrors(
            page
          );

        const routes = [
          {
            path:
              "/",
            verify:
              async () => {
                await expect(
                  page.getByRole(
                    "heading",
                    {
                      level:
                        1
                    }
                  )
                ).toContainText(
                  "Put evidence"
                );
              }
          },

          {
            path:
              "/docs",
            verify:
              async () => {
                await expect(
                  page.getByRole(
                    "heading",
                    {
                      level:
                        1
                    }
                  )
                ).toContainText(
                  "Evidence court"
                );
              }
          },

          {
            path:
              "/explorer",
            verify:
              async () => {
                await expect(
                  page.getByRole(
                    "heading",
                    {
                      level:
                        1
                    }
                  )
                ).toContainText(
                  "Inspect the record"
                );
              }
          },

          {
            path:
              "/cases/1",
            verify:
              async () => {
                await expect(
                  page
                ).toHaveURL(
                  /\/cases\/1$/
                );
              }
          }
        ];

        for (
          const route of
          routes
        ) {
          const response =
            await page.goto(
              route.path,
              {
                waitUntil:
                  "domcontentloaded"
              }
            );

          expect(
            response?.status()
          ).toBeLessThan(
            400
          );

          await expect(
            page.locator(
              "main#main-content"
            )
          ).toBeVisible();

          await route.verify();

          await saveA11y(
            page,
            testInfo.project.name,
            route.path
          );
        }

        const diagnostics =
          saveDiagnostics(
            testInfo.project.name,
            "core-routes",
            errors
          );

        expect(
          diagnostics.unexpected,
          diagnostics.unexpected.join(
            "\n"
          )
        ).toEqual([]);
      }
    );

    test(
      "live finalized browser reads settle to the certified state",
      async ({
        page
      }, testInfo) => {
        const errors =
          browserErrors(
            page
          );

        await eventually(
          3,
          async () => {
            await page.goto(
              "/explorer",
              {
                waitUntil:
                  "domcontentloaded"
              }
            );

            await expect(
              page.locator(
                ".explorer-count"
              )
            ).toContainText(
              "Showing 3 of 3 cases",
              {
                timeout:
                  40_000
              }
            );
          }
        );

        await eventually(
          3,
          async () => {
            await page.goto(
              "/cases/1",
              {
                waitUntil:
                  "domcontentloaded"
              }
            );

            await expect(
              page.locator(
                ".case-detail-hero"
              )
            ).toContainText(
              "SUPPORTED",
              {
                timeout:
                  40_000
              }
            );
          }
        );

        await page.screenshot({
          path:
            path.join(
              evidenceRoot(),
              "screenshots",
              `${safeName(testInfo.project.name)}-live-finalized-case-1.png`
            ),
          fullPage:
            true
        });

        const diagnostics =
          saveDiagnostics(
            testInfo.project.name,
            "live-finalized-read",
            errors
          );

        expect(
          diagnostics.unexpected,
          diagnostics.unexpected.join(
            "\n"
          )
        ).toEqual([]);
      }
    );

    test(
      "mock wallet connects, switches network, reviews an action, cancels, and disconnects without a write",
      async ({
        page,
        browserName
      }, testInfo) => {
        await coolDownStudioRpc(
          page,
          `${browserName}-mock-wallet`
        );

        await installMockWallet(
          page
        );

        const errors =
          browserErrors(
            page
          );

        await page.goto(
          "/explorer",
          {
            waitUntil:
              "domcontentloaded"
          }
        );

        await page
          .getByRole(
            "button",
            {
              name:
                "Connect wallet",
              exact:
                true
            }
          )
          .click();

        const connectDialog =
          page.getByRole(
            "dialog",
            {
              name:
                "Connect wallet"
            }
          );

        await expect(
          connectDialog
        ).toBeVisible();

        await expect(
          connectDialog
            .getByRole(
              "button",
              {
                name:
                  /SourceJury E2E Wallet/
              }
            )
        ).toBeVisible();

        await connectDialog
          .getByRole(
            "button",
            {
              name:
                /SourceJury E2E Wallet/
            }
          )
          .click();

        const walletTrigger =
          page.locator(
            ".wallet-trigger-connected"
          );

        await expect(
          walletTrigger
        ).toBeVisible();

        await walletTrigger.click();

        const details =
          page.getByRole(
            "dialog",
            {
              name:
                "Wallet details"
            }
          );

        await expect(
          details
        ).toBeVisible();

        await expect(
          details.getByRole(
            "button",
            {
              name:
                "Switch to Studio Devnet"
            }
          )
        ).toBeVisible();

        await details
          .getByRole(
            "button",
            {
              name:
                "Switch to Studio Devnet"
            }
          )
          .click();

        await expect(
          details
        ).toContainText(
          "GenLayer Studio Devnet"
        );

        const switchedChain =
          await page.evaluate(
            () =>
              (
                window as
                  typeof window & {
                    __sourcejuryE2E?: {
                      getChainId:
                        () => string;
                    };
                  }
              )
                .__sourcejuryE2E
                ?.getChainId()
          );

        expect(
          switchedChain
        ).toBe(
          "0xf22d"
        );

        await details
          .getByRole(
            "button",
            {
              name:
                "Close wallet panel"
            }
          )
          .click();

        await page
          .getByLabel(
            "Claim"
          )
          .fill(
            "Progress 5 browser-only review test. This must never be submitted."
          );

        await page
          .getByLabel(
            "Primary evidence URL"
          )
          .fill(
            "https://example.com/sourcejury-progress5-browser-test"
          );

        const reviewButton =
          page.getByRole(
            "button",
            {
              name:
                "Review action",
              exact:
                true
            }
          );

        await expect(
          reviewButton
        ).toBeEnabled();

        await reviewButton.click();

        const reviewDialog =
          page.getByRole(
            "dialog",
            {
              name:
                "Create evidence case"
            }
          );

        await expect(
          reviewDialog
        ).toBeVisible();

        await expect(
          reviewDialog
        ).toContainText(
          "create_case"
        );

        await expect(
          reviewDialog
        ).toContainText(
          E2E_ADDRESS
        );

        await expect(
          reviewDialog
        ).toContainText(
          CONTRACT
        );

        await expect(
          reviewDialog
        ).toContainText(
          "Progress 5 browser-only review test."
        );

        const confirm =
          reviewDialog
            .getByRole(
              "button",
              {
                name:
                  "Estimate fee & continue"
              }
            );

        await expect(
          confirm
        ).toBeVisible();

        const calls =
          await page.evaluate(
            () =>
              (
                window as
                  typeof window & {
                    __sourcejuryE2E?: {
                      getCalls:
                        () => string[];
                    };
                  }
              )
                .__sourcejuryE2E
                ?.getCalls() ??
              []
          );

        expect(
          calls
        ).not.toContain(
          "eth_sendTransaction"
        );

        expect(
          calls
        ).not.toContain(
          "eth_sendRawTransaction"
        );

        expect(
          calls
        ).not.toContain(
          "personal_sign"
        );

        expect(
          calls
        ).not.toContain(
          "eth_sign"
        );

        await page.screenshot({
          path:
            path.join(
              evidenceRoot(),
              "screenshots",
              `${safeName(testInfo.project.name)}-action-review.png`
            ),
          fullPage:
            true
        });

        await reviewDialog
          .getByRole(
            "button",
            {
              name:
                "Cancel"
            }
          )
          .click();

        await expect(
          reviewDialog
        ).toBeHidden();

        await walletTrigger.click();

        await page
          .getByRole(
            "dialog",
            {
              name:
                "Wallet details"
            }
          )
          .getByRole(
            "button",
            {
              name:
                "Disconnect"
            }
          )
          .click();

        await expect(
          page.getByRole(
            "button",
            {
              name:
                "Connect wallet",
              exact:
                true
            }
          )
        ).toBeVisible();

        const diagnostics =
          saveDiagnostics(
            testInfo.project.name,
            "mock-wallet",
            errors
          );

        expect(
          diagnostics.unexpected,
          diagnostics.unexpected.join(
            "\n"
          )
        ).toEqual([]);
      }
    );

    test(
      "keyboard skip navigation reaches main content",
      async ({
        page,
        browserName
      }) => {
        await page.goto(
          "/"
        );

        const skip =
          page.getByRole(
            "link",
            {
              name:
                "Skip to content"
            }
          );

        if (
          browserName ===
          "webkit"
        ) {
          await page
            .keyboard
            .press(
              "Alt+Tab"
            );
        } else {
          await page
            .keyboard
            .press(
              "Tab"
            );
        }

        await expect(
          skip
        ).toBeFocused();

        await expect(
          skip
        ).toBeVisible();

        await page
          .keyboard
          .press(
            "Enter"
          );

        await expect(
          page
        ).toHaveURL(
          /#main-content$/
        );
      }
    );

    test(
      "responsive layouts do not create horizontal page overflow",
      async ({
        page,
        browserName
      }, testInfo) => {
        test.skip(
          browserName !==
            "chromium",
          "Responsive matrix is certified once in Chromium."
        );

        const sizes = [
          {
            width:
              390,
            height:
              844
          },
          {
            width:
              768,
            height:
              1024
          },
          {
            width:
              1280,
            height:
              900
          }
        ];

        for (
          const size of
          sizes
        ) {
          await page.setViewportSize(
            size
          );

          for (
            const route of [
              "/",
              "/docs",
              "/explorer"
            ]
          ) {
            await page.goto(
              route,
              {
                waitUntil:
                  "domcontentloaded"
              }
            );

            await expect(
              page.locator(
                "main#main-content"
              )
            ).toBeVisible();

            const dimensions =
              await page.evaluate(
                () => ({
                  scrollWidth:
                    document
                      .documentElement
                      .scrollWidth,

                  clientWidth:
                    document
                      .documentElement
                      .clientWidth
                })
              );

            expect(
              dimensions.scrollWidth,
              `${route} overflow at ${size.width}px`
            ).toBeLessThanOrEqual(
              dimensions.clientWidth +
                1
            );
          }

          await page.goto(
            "/"
          );

          if (
            size.width <=
            1000
          ) {
            const menu =
              page.getByRole(
                "button",
                {
                  name:
                    "Toggle navigation"
                }
              );

            await expect(
              menu
            ).toBeVisible();

            await expect(
              menu
            ).toHaveAttribute(
              "aria-expanded",
              "false"
            );

            await menu.click();

            await expect(
              menu
            ).toHaveAttribute(
              "aria-expanded",
              "true"
            );

            await expect(
              page.getByRole(
                "navigation",
                {
                  name:
                    "Mobile navigation"
                }
              )
            ).toBeVisible();

            await menu.click();
          }

          await page.screenshot({
            path:
              path.join(
                evidenceRoot(),
                "screenshots",
                `${safeName(testInfo.project.name)}-home-${size.width}.png`
              ),
            fullPage:
              true
          });
        }
      }
    );

    test(
      "scroll reveals activate and reduced-motion mode disables reveal motion",
      async ({
        page,
        browserName
      }) => {
        test.skip(
          browserName !==
            "chromium",
          "Motion behavior is certified once in Chromium."
        );

        await page.emulateMedia({
          reducedMotion:
            "reduce"
        });

        await page.goto(
          "/"
        );

        const reduced =
          page.locator(
            ".reveal"
          ).first();

        await expect(
          reduced
        ).toBeVisible();

        const reducedStyle =
          await reduced.evaluate(
            (node) => {
              const style =
                getComputedStyle(
                  node
                );

              return {
                opacity:
                  style.opacity,
                transform:
                  style.transform
              };
            }
          );

        expect(
          reducedStyle.opacity
        ).toBe(
          "1"
        );

        expect(
          reducedStyle.transform
        ).toBe(
          "none"
        );

        await page.emulateMedia({
          reducedMotion:
            "no-preference"
        });

        await page.reload();

        const cta =
          page.locator(
            ".docs-cta-card"
          );

        await cta
          .scrollIntoViewIfNeeded();

        await expect(
          cta
        ).toHaveClass(
          /reveal-visible/,
          {
            timeout:
              10_000
          }
        );
      }
    );
  }
);
