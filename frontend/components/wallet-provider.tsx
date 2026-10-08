"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { STUDIO_DEVNET } from "@/lib/config";

export type EIP1193Provider = {
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void
  ) => void;
};

export type WalletDescriptor = {
  key: string;
  name: string;
  icon?: string;
  rdns?: string;
  provider: EIP1193Provider;
};

type WalletContextValue = {
  wallets: WalletDescriptor[];
  address?: `0x${string}`;
  activeWallet?: WalletDescriptor;
  provider?: EIP1193Provider;
  chainId?: number;
  balanceWei?: bigint;
  connecting: boolean;
  connected: boolean;
  correctNetwork: boolean;
  connect: (wallet: WalletDescriptor) => Promise<void>;
  disconnect: () => void;
  ensureStudioDevnet: () => Promise<void>;
  refresh: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      providers?: EIP1193Provider[];
      isMetaMask?: boolean;
    };
  }
}

function normalizeAddress(value: unknown): `0x${string}` | undefined {
  if (typeof value !== "string" || !value.startsWith("0x")) return undefined;
  return value as `0x${string}`;
}

function parseChainId(value: unknown) {
  if (typeof value === "string") return Number.parseInt(value, 16);
  if (typeof value === "number") return value;
  return undefined;
}

async function readWalletState(provider: EIP1193Provider) {
  const [accountsValue, chainValue] = await Promise.all([
    provider.request({ method: "eth_accounts" }),
    provider.request({ method: "eth_chainId" })
  ]);

  const accounts = Array.isArray(accountsValue) ? accountsValue : [];
  const address = normalizeAddress(accounts[0]);
  const chainId = parseChainId(chainValue);

  let balanceWei: bigint | undefined;
  if (address) {
    const balance = await provider.request({
      method: "eth_getBalance",
      params: [address, "latest"]
    });
    if (typeof balance === "string") balanceWei = BigInt(balance);
  }

  return { address, chainId, balanceWei };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<WalletDescriptor[]>([]);
  const [activeWallet, setActiveWallet] = useState<WalletDescriptor>();
  const [address, setAddress] = useState<`0x${string}`>();
  const [chainId, setChainId] = useState<number>();
  const [balanceWei, setBalanceWei] = useState<bigint>();
  const [connecting, setConnecting] = useState(false);
  const activeRef = useRef<WalletDescriptor | undefined>(undefined);

  const register = useCallback((wallet: WalletDescriptor) => {
    setWallets((current) => {
      if (current.some((item) => item.key === wallet.key)) return current;
      return [...current, wallet].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
  }, []);

  useEffect(() => {
    const announce = (event: Event) => {
      const custom = event as CustomEvent<{
        info: { uuid: string; name: string; icon?: string; rdns?: string };
        provider: EIP1193Provider;
      }>;
      if (!custom.detail?.provider || !custom.detail?.info) return;
      register({
        key: custom.detail.info.uuid,
        name: custom.detail.info.name,
        icon: custom.detail.info.icon,
        rdns: custom.detail.info.rdns,
        provider: custom.detail.provider
      });
    };

    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    if (window.ethereum) {
      const providers =
        window.ethereum.providers?.length
          ? window.ethereum.providers
          : [window.ethereum];

      providers.forEach((provider, index) =>
        register({
          key: `injected-${index}`,
          name:
            providers.length > 1
              ? `Browser Wallet ${index + 1}`
              : window.ethereum?.isMetaMask
                ? "MetaMask"
                : "Browser Wallet",
          provider
        })
      );
    }

    return () =>
      window.removeEventListener("eip6963:announceProvider", announce);
  }, [register]);

  const refresh = useCallback(async () => {
    const wallet = activeRef.current;
    if (!wallet) return;
    const state = await readWalletState(wallet.provider);
    setAddress(state.address);
    setChainId(state.chainId);
    setBalanceWei(state.balanceWei);
  }, []);

  const disconnect = useCallback(() => {
    activeRef.current = undefined;
    setActiveWallet(undefined);
    setAddress(undefined);
    setChainId(undefined);
    setBalanceWei(undefined);
    sessionStorage.removeItem("sourcejury-wallet-key");
  }, []);

  const ensureStudioDevnet = useCallback(async () => {
    const wallet = activeRef.current;
    if (!wallet) throw new Error("Connect a wallet first.");

    try {
      await wallet.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: STUDIO_DEVNET.hexId }]
      });
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? Number((error as { code?: unknown }).code)
          : undefined;

      if (code !== 4902) throw error;

      await wallet.provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: STUDIO_DEVNET.hexId,
          chainName: STUDIO_DEVNET.name,
          nativeCurrency: STUDIO_DEVNET.currency,
          rpcUrls: [STUDIO_DEVNET.rpc],
          blockExplorerUrls: [STUDIO_DEVNET.explorer]
        }]
      });

      await wallet.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: STUDIO_DEVNET.hexId }]
      });
    }

    await refresh();
  }, [refresh]);

  const connect = useCallback(async (wallet: WalletDescriptor) => {
    setConnecting(true);
    try {
      activeRef.current = wallet;
      setActiveWallet(wallet);

      const accountsValue = await wallet.provider.request({
        method: "eth_requestAccounts"
      });
      const accounts = Array.isArray(accountsValue) ? accountsValue : [];
      const nextAddress = normalizeAddress(accounts[0]);

      if (!nextAddress) throw new Error("Wallet returned no active account.");

      sessionStorage.setItem("sourcejury-wallet-key", wallet.key);

      const state = await readWalletState(wallet.provider);
      setAddress(state.address);
      setChainId(state.chainId);
      setBalanceWei(state.balanceWei);
    } finally {
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    const wallet = activeWallet;
    if (!wallet?.provider.on) return;

    const onAccountsChanged = () => void refresh();
    const onChainChanged = () => void refresh();

    wallet.provider.on("accountsChanged", onAccountsChanged);
    wallet.provider.on("chainChanged", onChainChanged);

    return () => {
      wallet.provider.removeListener?.("accountsChanged", onAccountsChanged);
      wallet.provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [activeWallet, refresh]);

  useEffect(() => {
    if (!wallets.length || activeWallet) return;
    const remembered = sessionStorage.getItem("sourcejury-wallet-key");
    const wallet = wallets.find((item) => item.key === remembered);
    if (!wallet) return;

    activeRef.current = wallet;
    setActiveWallet(wallet);
    void readWalletState(wallet.provider).then((state) => {
      if (!state.address) {
        disconnect();
        return;
      }
      setAddress(state.address);
      setChainId(state.chainId);
      setBalanceWei(state.balanceWei);
    });
  }, [wallets, activeWallet, disconnect]);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallets,
      address,
      activeWallet,
      provider: activeWallet?.provider,
      chainId,
      balanceWei,
      connecting,
      connected: Boolean(address && activeWallet),
      correctNetwork: chainId === STUDIO_DEVNET.id,
      connect,
      disconnect,
      ensureStudioDevnet,
      refresh
    }),
    [
      wallets,
      address,
      activeWallet,
      chainId,
      balanceWei,
      connecting,
      connect,
      disconnect,
      ensureStudioDevnet,
      refresh
    ]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}
