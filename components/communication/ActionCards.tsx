import { MessageSquare, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ActionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#EDE9FE] rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-6 h-6 text-[#8B5CF6]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900">SMS Campaigns</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Create and manage SMS campaigns via SMSPortal
          </p>
        </div>
        <Button variant="black" size="sm" className="flex-shrink-0">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#D1FAE5] rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-[#10B981]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900">Email Templates</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage templated emails and campaigns
          </p>
        </div>
        <Button variant="black" size="sm" className="flex-shrink-0">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>
    </div>
  );
}
