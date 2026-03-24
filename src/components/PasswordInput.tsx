import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showStrength?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
}

function getStrength(pw: string): { label: string; percent: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", percent: 20, color: "bg-destructive" };
  if (score <= 2) return { label: "Fair", percent: 40, color: "bg-orange-400" };
  if (score <= 3) return { label: "Good", percent: 60, color: "bg-yellow-400" };
  if (score <= 4) return { label: "Strong", percent: 80, color: "bg-emerald-400" };
  return { label: "Very Strong", percent: 100, color: "bg-emerald-500" };
}

export default function PasswordInput({ showStrength, className, value, onChange, label, placeholder, id, required }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength && value.length > 0 ? getStrength(value) : null;

  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {strength && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", strength.color)}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{strength.label}</p>
        </div>
      )}
    </div>
  );
}
