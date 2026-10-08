"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CircleDot,
  Copy,
  LogOut,
  Network,
  PlugZap,
  RefreshCw,
  WalletCards,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { compactAddress, copyText, formatGen } from "@/lib/format";
import { STUDIO_DEVNET } from "@/lib/config";

export function WalletControl() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  const copyAddress = async () => {
    if (!wallet.address) return;
    await copyText(wallet.address);
    toast.success("Address copied");
  };

  if (!wallet.connected) {
    return (
      <>
        <button
          className="wallet-trigger"
          onClick={() => setOpen(true)}
          aria-expanded={open}
        >
          <WalletCards size={17} />
          Connect wallet
        </button>
        {open && <WalletSheet onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        className="wallet-trigger wallet-trigger-connected"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <span
          className={`network-dot ${wallet.correctNetwork ? "online" : "warning"}`}
        />
        <span>{compactAddress(wallet.address)}</span>
        <ChevronDown size={15} />
      </button>

      {open && (
        <div
          className="sheet-backdrop"
          onMouseDown={() => setOpen(false)}
          role="presentation"
        >
          <section
            className="wallet-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Wallet details"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sheet-heading">
              <div>
                <span className="eyebrow">Connected wallet</span>
                <h2>{wallet.activeWallet?.name ?? "Wallet"}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setOpen(false)}
                aria-label="Close wallet panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="wallet-address-card">
              <CircleDot size={18} />
              <div>
                <span>Active account</span>
                <strong>{compactAddress(wallet.address, 6)}</strong>
              </div>
              <button
                className="icon-button"
                onClick={copyAddress}
                aria-label="Copy wallet address"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="wallet-metrics">
              <div>
                <span>Balance</span>
                <strong>{formatGen(wallet.balanceWei)}</strong>
              </div>
              <div>
                <span>Network</span>
                <strong>
                  {wallet.correctNetwork
                    ? STUDIO_DEVNET.name
                    : `Chain ${wallet.chainId ?? "—"}`}
                </strong>
              </div>
            </div>

            {!wallet.correctNetwork && (
              <button
                className="button button-primary button-wide"
                onClick={async () => {
                  try {
                    await wallet.ensureStudioDevnet();
                    toast.success("GenLayer Studio Devnet ready");
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to switch network"
                    );
                  }
                }}
              >
                <Network size={17} />
                Switch to Studio Devnet
              </button>
            )}

            <div className="wallet-sheet-actions">
              <button
                className="button button-ghost"
                onClick={() => void wallet.refresh()}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                className="button button-danger"
                onClick={() => {
                  wallet.disconnect();
                  setOpen(false);
                  toast.success("Wallet disconnected from SourceJury");
                }}
              >
                <LogOut size={16} />
                Disconnect
              </button>
            </div>

            <p className="microcopy">
              SourceJury never receives your wallet private key. Signing stays
              inside your wallet provider.
            </p>
          </section>
        </div>
      )}
    </>
  );
}

function WalletSheet({ onClose }: { onClose: () => void }) {
  const wallet = useWallet();

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        className="wallet-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Connect wallet"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-heading">
          <div>
            <span className="eyebrow">Wallet access</span>
            <h2>Enter the court</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close wallet selector"
          >
            <X size={18} />
          </button>
        </div>

        <p className="sheet-copy">
          Browse cases without a wallet. Connect only when you want to submit
          or challenge evidence.
        </p>

        <div className="wallet-list">
          {wallet.wallets.length ? (
            wallet.wallets.map((item) => (
              <button
                key={item.key}
                className="wallet-option"
                disabled={wallet.connecting}
                onClick={async () => {
                  try {
                    await wallet.connect(item);
                    toast.success(`${item.name} connected`);
                    onClose();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Wallet connection failed"
                    );
                  }
                }}
              >
                <span className="wallet-icon">
                  {item.icon ? (
                    <img src={item.icon} alt="" />
                  ) : (
                    <PlugZap size={18} />
                  )}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.rdns ?? "Injected EIP-1193 wallet"}</small>
                </span>
                <Check size={16} />
              </button>
            ))
          ) : (
            <div className="empty-wallets">
              <WalletCards size={24} />
              <strong>No browser wallet detected</strong>
              <span>
                Install a compatible EVM wallet such as MetaMask or Rabby,
                reload the page, then connect.
              </span>
            </div>
          )}
        </div>

        <div className="security-note">
          <Network size={17} />
          <span>
            Writes are locked to GenLayer Studio Devnet, chain 61997.
          </span>
        </div>
      </section>
    </div>
  );
}
