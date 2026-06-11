"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, FilePlus2, TriangleAlert } from "lucide-react";
import { createTicketAction } from "@/app/admin/(app)/tickets/new/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketPreview } from "@/components/admin/ticket-preview";
import { toPreviewTicket, type IssuanceDraft } from "@/lib/preview";
import { localToManilaISO, nowManilaLocalInput, formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NewTicketInput } from "@/lib/data/store";
import type { Officer, ViolationCatalogItem } from "@/lib/types";

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

function ViolationRow({
  item,
  checked,
  details,
  onToggle,
  onDetails,
}: {
  item: ViolationCatalogItem;
  checked: boolean;
  details: string;
  onToggle: (checked: boolean) => void;
  onDetails: (v: string) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        checked ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`v-${item.code}`}
          checked={checked}
          onCheckedChange={(v) => onToggle(v === true)}
          className="mt-0.5"
        />
        <label htmlFor={`v-${item.code}`} className="flex-1 cursor-pointer">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="shrink-0 text-sm font-medium tabular-nums">
              {formatPeso(item.basicFine)}
            </span>
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {item.code}
          </span>
        </label>
      </div>
      {checked ? (
        <Textarea
          value={details}
          onChange={(e) => onDetails(e.target.value)}
          placeholder="Add details — location, circumstances, plate, etc."
          rows={2}
          className="mt-2.5"
        />
      ) : null}
    </div>
  );
}

export function IssuanceForm({
  catalog,
  officers,
}: {
  catalog: ViolationCatalogItem[];
  officers: Officer[];
}) {
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [plateNumber, setPlateNumber] = React.useState("");
  const [contactNo, setContactNo] = React.useState("");
  const [apprehendedLocal, setApprehendedLocal] = React.useState("");
  const [placeOfViolation, setPlaceOfViolation] = React.useState("");
  const [officerId, setOfficerId] = React.useState(officers[0]?.id ?? "");
  const [selected, setSelected] = React.useState<Record<string, string>>({});
  const [remarks, setRemarks] = React.useState("");

  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    // Initialize from wall-clock time after mount to avoid an SSR/client mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    setApprehendedLocal(nowManilaLocalInput());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function toggle(code: string, checked: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[code] = next[code] ?? "";
      else delete next[code];
      return next;
    });
  }

  const violator = {
    firstName,
    middleName: middleName || undefined,
    lastName,
    address,
    licenseNumber,
    plateNumber: plateNumber || undefined,
    contactNo: contactNo || undefined,
  };

  const chosen = catalog.filter((c) => c.code in selected);
  const total = chosen.reduce((s, c) => s + c.basicFine, 0);

  const draft: IssuanceDraft = {
    violator,
    apprehendedAtISO: apprehendedLocal ? localToManilaISO(apprehendedLocal) : "",
    placeOfViolation: placeOfViolation || undefined,
    officer: officers.find((o) => o.id === officerId),
    violations: chosen.map((c) => ({ item: c, details: selected[c.code] })),
    remarks: remarks || undefined,
  };
  const preview = toPreviewTicket(draft, new Date());

  const valid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!address.trim() &&
    !!licenseNumber.trim() &&
    !!apprehendedLocal &&
    !!officerId &&
    chosen.length > 0;

  function issue() {
    setError(null);
    const input: NewTicketInput = {
      violator,
      apprehendedAt: localToManilaISO(apprehendedLocal),
      placeOfViolation: placeOfViolation || undefined,
      officerId,
      violations: Object.entries(selected).map(([catalogCode, details]) => ({
        catalogCode,
        details: details || undefined,
      })),
      remarks: remarks || undefined,
    };
    startTransition(async () => {
      const res = await createTicketAction(input);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      }
      // success → the action redirects, navigating away from this page
    });
  }

  const traffic = catalog.filter((c) => c.category === "TRAFFIC");
  const ordinance = catalog.filter((c) => c.category === "ORDINANCE");

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form */}
      <div className="space-y-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Violator details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField id="firstName" label="First name" value={firstName} onChange={setFirstName} required />
            <TextField id="middleName" label="Middle name" value={middleName} onChange={setMiddleName} />
            <TextField id="lastName" label="Last name" value={lastName} onChange={setLastName} required />
            <TextField id="license" label="License number" value={licenseNumber} onChange={setLicenseNumber} required placeholder="N03-12-345678" />
            <div className="sm:col-span-2">
              <TextField id="address" label="Address" value={address} onChange={setAddress} required placeholder="Purok, barangay, Santa Cruz, Zambales" />
            </div>
            <TextField id="plate" label="Plate number" value={plateNumber} onChange={setPlateNumber} placeholder="ABC 1234" />
            <TextField id="contact" label="Contact number" value={contactNo} onChange={setContactNo} placeholder="0917 555 0000" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apprehension details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="apprehendedAt">
                Date &amp; time<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="apprehendedAt"
                type="datetime-local"
                value={apprehendedLocal}
                onChange={(e) => setApprehendedLocal(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officer">
                Apprehending officer<span className="text-destructive"> *</span>
              </Label>
              <select
                id="officer"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className={fieldClass}
              >
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                    {o.badgeNo ? ` (${o.badgeNo})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <TextField id="place" label="Place of violation" value={placeOfViolation} onChange={setPlaceOfViolation} placeholder="Street / landmark, Santa Cruz" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Violations</CardTitle>
            <CardDescription>
              Tick each violation and add details. Fines total automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Traffic
              </p>
              <div className="space-y-2">
                {traffic.map((c) => (
                  <ViolationRow
                    key={c.code}
                    item={c}
                    checked={c.code in selected}
                    details={selected[c.code] ?? ""}
                    onToggle={(v) => toggle(c.code, v)}
                    onDetails={(v) =>
                      setSelected((p) => ({ ...p, [c.code]: v }))
                    }
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ordinance
              </p>
              <div className="space-y-2">
                {ordinance.map((c) => (
                  <ViolationRow
                    key={c.code}
                    item={c}
                    checked={c.code in selected}
                    details={selected[c.code] ?? ""}
                    onToggle={(v) => toggle(c.code, v)}
                    onDetails={(v) =>
                      setSelected((p) => ({ ...p, [c.code]: v }))
                    }
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes for this ticket."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Live preview + action */}
      <div className="lg:col-span-2">
        <div className="space-y-4 lg:sticky lg:top-6">
          {mounted ? (
            <TicketPreview ticket={preview} />
          ) : (
            <Skeleton className="h-80 w-full rounded-xl" />
          )}

          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Total fines</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatPeso(total)}
                </p>
              </div>
              <Button
                type="button"
                disabled={!valid}
                onClick={() => {
                  setError(null);
                  setOpen(true);
                }}
                className="h-10 gap-2 px-4"
              >
                <FilePlus2 className="size-4" />
                Review &amp; issue
              </Button>
            </CardContent>
          </Card>

          {!valid ? (
            <p className="text-center text-xs text-muted-foreground">
              Fill the required fields and select at least one violation.
            </p>
          ) : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm &amp; issue ticket</DialogTitle>
            <DialogDescription>
              This issues an official OVR for{" "}
              <span className="font-medium text-foreground">
                {firstName} {lastName}
              </span>{" "}
              with {chosen.length}{" "}
              {chosen.length === 1 ? "violation" : "violations"} totaling{" "}
              <span className="font-medium text-foreground">
                {formatPeso(total)}
              </span>
              . It becomes immediately searchable by the citizen.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={isPending} />}
            >
              Cancel
            </DialogClose>
            <Button onClick={issue} disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FilePlus2 className="size-4" />
              )}
              Confirm &amp; issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
