"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UsersTab } from "@/components/settings/UsersTab";
import { TemplatesTab } from "@/components/settings/TemplatesTab";
import { PasswordTab } from "@/components/settings/PasswordTab";
import { SystemTab } from "@/components/settings/SystemTab";
import { WebhooksTab } from "@/components/settings/WebhooksTab";

const ALL_TABS = [
  { id: "users",     label: "Users" },
  { id: "templates", label: "Mapping Templates" },
  { id: "password",  label: "Change Password" },
  { id: "webhooks",  label: "Webhooks" },
  { id: "system",    label: "System" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === "admin" ? "users" : "templates"
  );

  const tabs = user?.role === "admin"
    ? ALL_TABS
    : ALL_TABS.filter(t => t.id !== "users");

  return (
    <div className="flex flex-col gap-5">
      {/* Tab bar — scrollable on mobile */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 bg-white border border-neutral-200 rounded-xl p-1 w-fit min-w-full sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "users"     && user?.role === "admin" && <UsersTab />}
      {activeTab === "templates" && <TemplatesTab />}
      {activeTab === "password"  && <PasswordTab />}
      {activeTab === "webhooks"  && <WebhooksTab />}
      {activeTab === "system"    && <SystemTab />}
    </div>
  );
}
