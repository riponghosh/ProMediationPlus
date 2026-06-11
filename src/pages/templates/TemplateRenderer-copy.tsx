import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTemplateById } from "../../api/templateService";
import { ChevronLeft, User, TrendingUp, TrendingDown, Briefcase, AlertCircle, FileText, Calendar, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/layout";

// ─── Section: Party Details ───────────────────────────────────────────────────
const PartyDetailsSection = ({ section }) => {
  const { firstName, lastName, role } = section.data;

  const roleColor = {
    Applicant: "bg-blue-50 text-blue-700 border-blue-200",
    Respondent: "bg-amber-50 text-amber-700 border-amber-200",
    Other: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const avatarColor = {
    Applicant: "bg-blue-100 text-blue-700",
    Respondent: "bg-amber-100 text-amber-700",
    Other: "bg-gray-200 text-gray-600",
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white">
      <div className={`h-11 w-11 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${avatarColor[role] ?? "bg-gray-100 text-gray-600"}`}>
        {initials || <User className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {firstName} {lastName}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">Party in this agreement</p>
      </div>
      <span className={`text-xs font-medium border px-2.5 py-1 rounded-full flex-shrink-0 ${roleColor[role] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {role}
      </span>
    </div>
  );
};

// ─── Section: Financial List (Income / Expenses / Assets / Liabilities) ───────
const FinancialSection = ({ section }) => {
  const { items = [], notes } = section.data;
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const config = {
    INCOME:      { icon: TrendingUp,   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200", totalLabel: "Total Income",      currency: "€" },
    EXPENSES:    { icon: TrendingDown, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",   totalLabel: "Total Expenses",    currency: "€" },
    ASSETS:      { icon: Briefcase,    color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200",totalLabel: "Total Assets",      currency: "€" },
    LIABILITIES: { icon: AlertCircle,  color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",totalLabel: "Total Liabilities", currency: "€" },
  };

  const cfg = config[section.type] ?? config.INCOME;
  const Icon = cfg.icon;

  return (
    <div className={`border rounded-lg overflow-hidden ${cfg.border}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-3 ${cfg.bg}`}>
        <Icon className={`h-4 w-4 ${cfg.color}`} />
        <span className={`text-sm font-semibold ${cfg.color}`}>{section.title}</span>
      </div>

      {/* Items */}
      <div className="bg-white divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-3 italic">No items added.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">{item.description}</span>
              <span className="text-sm font-medium text-gray-900 tabular-nums">
                {cfg.currency}{Number(item.amount ?? 0).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Total row */}
      {items.length > 0 && (
        <div className={`flex items-center justify-between px-4 py-2.5 border-t ${cfg.border} ${cfg.bg}`}>
          <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.totalLabel}</span>
          <span className={`text-sm font-bold tabular-nums ${cfg.color}`}>
            {cfg.currency}{total.toLocaleString()}
          </span>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 font-medium mb-0.5">Notes</p>
          <p className="text-sm text-gray-600">{notes}</p>
        </div>
      )}
    </div>
  );
};

// ─── Section: Custom Text ─────────────────────────────────────────────────────
const CustomTextSection = ({ section }) => (
  <div className="border rounded-lg bg-white overflow-hidden border-gray-200">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
      <FileText className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-semibold text-gray-700">{section.title}</span>
    </div>
    <p className="px-4 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
      {section.data?.content || <span className="italic text-gray-400">No content provided.</span>}
    </p>
  </div>
);

// ─── Unknown section fallback ─────────────────────────────────────────────────
const UnknownSection = ({ section }) => (
  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
    <p className="text-sm text-yellow-700 font-medium">Unknown section type: <code>{section.type}</code></p>
  </div>
);

// ─── Section dispatcher ───────────────────────────────────────────────────────
const renderSection = (section) => {
  switch (section.type) {
    case "PARTY_DETAILS":
      return <PartyDetailsSection key={section.id} section={section} />;
    case "INCOME":
    case "EXPENSES":
    case "ASSETS":
    case "LIABILITIES":
      return <FinancialSection key={section.id} section={section} />;
    case "CUSTOM_TEXT":
      return <CustomTextSection key={section.id} section={section} />;
    default:
      return <UnknownSection key={section.id} section={section} />;
  }
};

// ─── Group sections by type for visual grouping ───────────────────────────────
const groupSections = (sections) => {
  const groups = [];
  let partyGroup = [];
  let financialGroup = [];
  const FINANCIAL_TYPES = ["INCOME", "EXPENSES", "ASSETS", "LIABILITIES"];

  sections.forEach((sec) => {
    if (sec.type === "PARTY_DETAILS") {
      if (financialGroup.length) { groups.push({ kind: "financial", items: financialGroup }); financialGroup = []; }
      partyGroup.push(sec);
    } else if (FINANCIAL_TYPES.includes(sec.type)) {
      if (partyGroup.length) { groups.push({ kind: "party", items: partyGroup }); partyGroup = []; }
      financialGroup.push(sec);
    } else {
      if (partyGroup.length) { groups.push({ kind: "party", items: partyGroup }); partyGroup = []; }
      if (financialGroup.length) { groups.push({ kind: "financial", items: financialGroup }); financialGroup = []; }
      groups.push({ kind: "other", items: [sec] });
    }
  });
  if (partyGroup.length) groups.push({ kind: "party", items: partyGroup });
  if (financialGroup.length) groups.push({ kind: "financial", items: financialGroup });
  return groups;
};

// ─── Financial summary bar ────────────────────────────────────────────────────
const FinancialSummary = ({ sections }) => {
  const FINANCIAL_TYPES = ["INCOME", "EXPENSES", "ASSETS", "LIABILITIES"];
  const financials = sections.filter((s) => FINANCIAL_TYPES.includes(s.type));
  if (financials.length === 0) return null;

  const totals = {};
  financials.forEach((sec) => {
    const sum = (sec.data?.items ?? []).reduce((a, i) => a + (Number(i.amount) || 0), 0);
    totals[sec.type] = sum;
  });

  const summaryItems = [
    { key: "INCOME",      label: "Income",      color: "text-green-700",  bg: "bg-green-50"  },
    { key: "EXPENSES",    label: "Expenses",    color: "text-red-700",    bg: "bg-red-50"    },
    { key: "ASSETS",      label: "Assets",      color: "text-purple-700", bg: "bg-purple-50" },
    { key: "LIABILITIES", label: "Liabilities", color: "text-orange-700", bg: "bg-orange-50" },
  ].filter((item) => totals[item.key] !== undefined);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {summaryItems.map(({ key, label, color, bg }) => (
        <div key={key} className={`rounded-lg p-3 ${bg}`}>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-base font-bold tabular-nums ${color}`}>€{(totals[key] ?? 0).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main TemplateRenderer ────────────────────────────────────────────────────
function TemplateRenderer() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getTemplateById(id);
        if (res?.success) setTemplate(res.data);
        else setError("Template load failed.");
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Parse content string → object
  const content = (() => {
    if (!template?.content) return null;
    try {
      return typeof template.content === "string"
        ? JSON.parse(template.content)
        : template.content;
    } catch {
      return null;
    }
  })();

  const sections = content?.sections ?? [];
  const groups = groupSections(sections);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  // ── Loading ──
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm">Template load is in progress…</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Error ──
  if (error || !template) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-gray-600">{error ?? "Template not found."}</p>
          <Button variant="outline" asChild>
            <Link to="/templates"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Templates</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // ── Render ──
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top bar */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/templates"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 truncate">{template.title}</h1>
            {template.description && (
              <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1.5" /> Print
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Export
            </Button>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="outline" className="capitalize">{template.category}</Badge>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {formatDate(template.createdAt)}</span>
          </div>
          {template.lastUsedAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last used {formatDate(template.lastUsedAt)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Financial summary (if any financial sections exist) */}
        <FinancialSummary sections={sections} />

        {/* Sections */}
        {sections.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">This template has no sections.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group, gi) => {
              if (group.kind === "party") {
                return (
                  <div key={gi}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Parties</p>
                    <div className="space-y-2">
                      {group.items.map(renderSection)}
                    </div>
                  </div>
                );
              }
              if (group.kind === "financial") {
                return (
                  <div key={gi}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Financials</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {group.items.map(renderSection)}
                    </div>
                  </div>
                );
              }
              return <div key={gi}>{group.items.map(renderSection)}</div>;
            })}
          </div>
        )}

      </div>
    </Layout>
  );
}

// export default TemplateRenderer;