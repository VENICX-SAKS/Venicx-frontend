"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChangePassword } from "@/hooks/useSettings";

export function PasswordTab() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = () => {
    setError(""); setSuccess("");
    if (!form.current_password || !form.new_password) { setError("All fields are required"); return; }
    if (form.new_password !== form.confirm) { setError("New passwords do not match"); return; }
    if (form.new_password.length < 8) { setError("New password must be at least 8 characters"); return; }
    changePassword(
      { current_password: form.current_password, new_password: form.new_password },
      {
        onSuccess: () => {
          setSuccess("Password changed successfully");
          setForm({ current_password: "", new_password: "", confirm: "" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (e: any) => setError(e.message),
      }
    );
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <h3 className="text-sm font-semibold text-neutral-900">Change Password</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Input label="Current Password" type="password" value={form.current_password}
            onChange={e => setForm(p => ({ ...p, current_password: e.target.value }))} />
          <Input label="New Password" type="password" value={form.new_password}
            onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} />
          <Input label="Confirm New Password" type="password" value={form.confirm}
            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
          {error && <p className="text-sm text-error">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}
          <Button variant="primary" loading={isPending} onClick={handleSubmit} className="self-start">
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
