import {
  MessageCircle, AlertCircle, Car, Train, CloudRain, Coffee, Trophy,
  Calendar, Shield, Heart, Search, AlertTriangle, CheckCircle,
} from "lucide-react";
import type { SignalType } from "@/types/database";

export const SIGNAL_STYLES: Record<SignalType, { Icon: any; color: string; label: string }> = {
  "citizen-report":  { Icon: MessageCircle,  color: "#3A7D44", label: "Citizen report" },
  "breaking-news":   { Icon: AlertCircle,    color: "#C8102E", label: "Breaking news" },
  "traffic":         { Icon: Car,            color: "#E8A317", label: "Traffic" },
  "transit":         { Icon: Train,          color: "#1E5F8E", label: "Transit" },
  "weather-alert":   { Icon: CloudRain,      color: "#1E5F8E", label: "Weather" },
  "food":            { Icon: Coffee,         color: "#B87333", label: "Food & drink" },
  "sports":          { Icon: Trophy,         color: "#1E5F8E", label: "Sports" },
  "event":           { Icon: Calendar,       color: "#B87333", label: "Event" },
  "public-safety":   { Icon: Shield,         color: "#A0202C", label: "Public safety" },
  "good-news":       { Icon: Heart,          color: "#3A7D44", label: "Good news" },
  "fact-check":      { Icon: Search,         color: "#0F1419", label: "Fact check" },
  "unresolved":      { Icon: AlertTriangle,  color: "#E8A317", label: "Unresolved" },
  "solved":          { Icon: CheckCircle,    color: "#3A7D44", label: "Solved" },
};
