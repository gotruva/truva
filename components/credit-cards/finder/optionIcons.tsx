import {
  Calendar,
  CheckCircle,
  CreditCard,
  Gift,
  Info,
  Plane,
  Shield,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';
import type { ComponentType } from 'react';

type IconType = ComponentType<{ className?: string }>;

/** One icon per choice id (handoff: max one icon per tile). */
const OPTION_ICON: Record<string, IconType> = {
  // Q1 first
  yes: Sparkles,
  no: CreditCard,
  helping: Shield,
  // Q2 income
  '<15': Wallet,
  '15-30': Wallet,
  '30-50': Wallet,
  '50-100': Wallet,
  '100+': Wallet,
  skip: Info,
  // Q3 spend
  groceries: ShoppingBag,
  dining: Utensils,
  online: Zap,
  bills: Calendar,
  travel: Plane,
  general: Wallet,
  unsure: Info,
  // Q4 priority
  naf: Wallet,
  cashback: Sparkles,
  points: Gift,
  // travel reused
  easy: CheckCircle,
  simple: Shield,
  // Q5 avoid
  fees: Wallet,
  income: Shield,
  complex: Info,
  promo: Calendar,
  forex: Plane,
};

export function OptionIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const Icon = OPTION_ICON[id] ?? Sparkles;
  return <Icon className={className} />;
}
