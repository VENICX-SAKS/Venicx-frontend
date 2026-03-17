"use client";

import { useState } from "react";
import { Plus, UserCheck, UserX } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUsers, useInviteUser, useUpdateUser } from "@/hooks/useSettings";
import { formatDate } from "@/lib/utils";

export function UsersTab() {
  const { data: users, isLoading } = useUsers();
  const { mutate: inviteUser, isPending: inviting } = useInviteUser();
  const { mutate: updateUser } = useUpdateUser();

  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", role: "operator", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInvite = () => {
    setError(""); setSuccess("");
    if (!form.email || !form.full_name || !form.password) {
      setError("All fields are required"); return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inviteUser(form, {
      onSuccess: () => {
        setSuccess("User invited successfully");
        setForm({ email: "", full_name: "", role: "operator", password: "" });
        setShowInvite(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (e: any) => setError(e.message),
    });
  };

  const roleBadgeColor = (role: string) => {
    if (role === "admin") return "bg-primary/10 text-primary";
    if (role === "operator") return "bg-[#EDE9FE] text-[#8B5CF6]";
    return "bg-neutral-100 text-neutral-500";
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Team Members</h3>
            <Button variant="primary" size="sm" onClick={() => setShowInvite(!showInvite)}>
              <Plus className="w-4 h-4" /> Invite User
            </Button>
          </div>
        </CardHeader>

        {showInvite && (
          <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input label="Full Name" value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              <Input label="Email" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <Input label="Temporary Password" type="password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="admin">Admin</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-error mb-3">{error}</p>}
            {success && <p className="text-sm text-success mb-3">{success}</p>}
            <div className="flex gap-2">
              <Button variant="primary" size="sm" loading={inviting} onClick={handleInvite}>
                Send Invite
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="divide-y divide-neutral-100">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/4" />
            </div>
          ))}
          {!isLoading && users?.map(user => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-neutral-900">
                    {user.full_name ?? user.email}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  {!user.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-error/10 text-error">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                  {user.email} · Joined {formatDate(user.created_at)}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {user.is_active ? (
                  <Button variant="ghost" size="sm"
                    onClick={() => updateUser({ id: user.id, is_active: false })}>
                    <UserX className="w-4 h-4 text-error" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm"
                    onClick={() => updateUser({ id: user.id, is_active: true })}>
                    <UserCheck className="w-4 h-4 text-success" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
