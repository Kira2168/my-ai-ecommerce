"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Save, Loader2, Trash2, Eye, EyeOff } from "lucide-react";

type Profile = {
  displayName: string;
  image: string | null;
  mfaEnabled: boolean;
  apiKeyRotatedAt: string | null;
  lastLoginAt: string | null;
};

type Stats = {
  completedOrders: number;
  pendingOrders: number;
  actions24h: number;
  riskLevel: string;
};

type Account = {
  email: string;
  displayName: string;
};

export default function ProfileEditor({ initialProfile, initialStats, initialAccount }: { initialProfile: Profile; initialStats: Stats; initialAccount: Account }) {
  const [profile, setProfile] = useState(initialProfile);
  const [stats, setStats] = useState(initialStats);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [account, setAccount] = useState(initialAccount);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState("");
  const [resettingMfa, setResettingMfa] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ touchLastLogin: true }),
    }).catch(() => undefined);
  }, []);

  const refreshProfile = async () => {
    const res = await fetch("/api/admin-profile", { cache: "no-store" });
    const data = await res.json();
    if (data?.profile) {
      setProfile(data.profile);
      setStats(data.stats);
    }
  };

  const saveProfile = async (payload: Record<string, any>) => {
    setSaving(true);
    try {
      await fetch("/api/admin-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  };

  const saveAccount = async () => {
    setAccountMsg("");
    setAccountSaving(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: account.displayName,
          email: account.email,
          currentPassword,
          newPassword,
          mfaCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountMsg(data?.error || "Failed to save account.");
        return;
      }

      setAccount((prev) => ({ ...prev, ...data.account }));
      setProfile((p) => ({ ...p, displayName: data.account.displayName || p.displayName }));
      setCurrentPassword("");
      setNewPassword("");
      setMfaCode("");
      setAccountMsg(
        data?.requiresMfaReenroll
          ? "Account updated. MFA reset required: log out and scan new QR on next admin login."
          : "Account updated."
      );
    } finally {
      setAccountSaving(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = String(reader.result || "");
      await saveProfile({ image: img });
    };
    reader.readAsDataURL(file);
  };

  const resetMfa = async () => {
    setAccountMsg("");
    if (!currentPassword) {
      setAccountMsg("Enter current password to reset MFA.");
      return;
    }
    if (!/^\d{6}$/.test(mfaCode)) {
      setAccountMsg("Enter 6-digit MFA code to reset MFA.");
      return;
    }

    const confirmed = window.confirm("Reset MFA? You will need to scan a new QR code on next login.");
    if (!confirmed) return;

    setResettingMfa(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetMfa: true, currentPassword, mfaCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountMsg(data?.error || "Failed to reset MFA.");
        return;
      }

      setMfaCode("");
      setCurrentPassword("");
      setAccountMsg("MFA reset complete. Log out and scan a new QR code on next login.");
    } finally {
      setResettingMfa(false);
    }
  };

  const deleteProfile = async () => {
    const confirmed = window.confirm("Delete your admin profile? This will reset it to defaults.");
    if (!confirmed) return;

    if (!/^\d{6}$/.test(mfaCode)) {
      setAccountMsg("Enter 6-digit MFA code before deleting profile.");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/admin-profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountMsg(data?.error || "Failed to delete profile.");
        return;
      }

      setMfaCode("");
      await refreshProfile();
    } finally {
      setDeleting(false);
    }
  };

  const lastLogin = profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "No login data";
  const rotatedAt = profile.apiKeyRotatedAt ? new Date(profile.apiKeyRotatedAt).toLocaleDateString() : "Not recorded";

  return (
    <>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-2xl border border-brand/40 bg-brand/10 overflow-hidden shrink-0"
                title="Upload profile picture"
              >
                {profile.image ? (
                  <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Operator Profile</p>
                <input
                  value={profile.displayName}
                  onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                  className="bg-transparent border border-white/10 rounded-xl px-3 py-2 text-xl sm:text-2xl font-black uppercase tracking-tight w-full max-w-md outline-none focus:border-brand"
                />
                <p className="text-sm text-foreground/60 mt-2 max-w-xl">
                  Primary system maintainer. Handles drops, inventory control, order operations, and AI storefront tuning.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={deleteProfile}
                disabled={deleting || saving}
                className="px-3 py-2 rounded-xl border border-red-500/40 text-red-300 text-[10px] font-mono uppercase tracking-[0.3em] disabled:opacity-60 flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
              </button>
              <button
                type="button"
                onClick={() => saveProfile({ displayName: profile.displayName })}
                disabled={saving || deleting}
                className="px-3 py-2 rounded-xl bg-brand text-black text-[10px] font-mono uppercase tracking-[0.3em] disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Access Level</p>
              <p className="text-xl font-black text-foreground">Admin</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Completed Orders</p>
              <p className="text-xl font-black text-foreground">{stats.completedOrders}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Pending Orders</p>
              <p className="text-xl font-black text-foreground">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-4">Security Posture</p>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground/60">MFA</span>
              <span className={`${profile.mfaEnabled ? "text-emerald-400" : "text-red-400"} font-bold`}>
                {profile.mfaEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/60">API Key Rotated</span>
              <span className="text-foreground font-bold">{rotatedAt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/60">Risk Level</span>
              <span className={`${stats.riskLevel === "Low" ? "text-emerald-400" : "text-amber-400"} font-bold`}>
                {stats.riskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-4">Recent Operator Activity</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
            <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Last Login</p>
            <p className="mt-2 text-lg font-black">{lastLogin}</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
            <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Actions (24h)</p>
            <p className="mt-2 text-lg font-black">{stats.actions24h} Events</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
            <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Profile Image</p>
            <p className="mt-2 text-lg font-black">{profile.image ? "Configured" : "Not set"}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-4">Admin Credentials</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-2">Admin Name</label>
            <input
              value={account.displayName}
              onChange={(e) => setAccount((a) => ({ ...a, displayName: e.target.value }))}
              className="w-full bg-(--card-bg) border border-(--border-color) rounded-xl px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-2">Admin Email</label>
            <input
              type="email"
              value={account.email}
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              className="w-full bg-(--card-bg) border border-(--border-color) rounded-xl px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-(--card-bg) border border-(--border-color) rounded-xl px-3 py-2 pr-10 outline-none focus:border-brand"
                placeholder="Required to change password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-(--card-bg) border border-(--border-color) rounded-xl px-3 py-2 outline-none focus:border-brand"
              placeholder="Leave empty to keep current"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-2">MFA Code</label>
            <input
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
              className="w-full bg-(--card-bg) border border-(--border-color) rounded-xl px-3 py-2 outline-none focus:border-brand font-mono tracking-[0.3em]"
              placeholder="123456"
            />
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-foreground/45">
              Required when changing admin email or password or changing profile picture. 
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p
            className={`text-xs font-mono ${
              accountMsg.includes("updated") || accountMsg.includes("reset complete")
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {accountMsg}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetMfa}
              disabled={resettingMfa || accountSaving}
              className="px-4 py-2 rounded-xl border border-red-500/40 text-red-300 text-[10px] font-mono uppercase tracking-[0.3em] disabled:opacity-50"
            >
              {resettingMfa ? "Resetting..." : "Reset MFA"}
            </button>
            <button
              type="button"
              onClick={saveAccount}
              disabled={accountSaving || resettingMfa}
              className="px-4 py-2 rounded-xl bg-brand text-black text-[10px] font-mono uppercase tracking-[0.3em] disabled:opacity-50"
            >
              {accountSaving ? "Saving..." : "Save Account"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
