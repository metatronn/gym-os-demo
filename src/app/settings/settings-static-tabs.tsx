"use client";

import { Users, Shield } from "lucide-react";

export function StaffTab() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gym-text mb-1">Staff & Roles</h2>
      <p className="text-sm text-gym-text-muted mb-6">
        Manage team members and permissions
      </p>
      <div className="max-w-2xl">
        <div className="p-6 bg-gym-card border border-gym-border rounded-xl text-center">
          <Users className="w-8 h-8 text-gym-primary mx-auto mb-3" />
          <p className="text-sm text-gym-text mb-2">
            Staff access is now managed by GYM OS
          </p>
          <p className="text-xs text-gym-text-muted mb-4">
            Native email/password auth is active. Invite teammates through the
            tenant invite flow while this staff UI grows into a full management
            surface.
          </p>
          <span className="inline-flex items-center gap-2 rounded-lg bg-gym-primary/10 px-4 py-2 text-sm font-medium text-gym-accent">
            Native auth enabled <Shield className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function SecurityTab() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gym-text mb-1">Security</h2>
      <p className="text-sm text-gym-text-muted mb-6">
        Manage access and security settings
      </p>
      <div className="max-w-2xl">
        <div className="p-6 bg-gym-card border border-gym-border rounded-xl text-center">
          <Shield className="w-8 h-8 text-gym-primary mx-auto mb-3" />
          <p className="text-sm text-gym-text mb-2">
            Security is now managed in-app
          </p>
          <p className="text-xs text-gym-text-muted mb-4">
            GYM OS now owns password hashing, session cookies, and tenant
            switching directly. Advanced controls like MFA can build on top of
            this foundation here.
          </p>
          <span className="inline-flex items-center gap-2 rounded-lg bg-gym-primary/10 px-4 py-2 text-sm font-medium text-gym-accent">
            App-managed security <Shield className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
