import NativePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Action } from "./ui";

export function DatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [day, month, year] = value.split("/").map(Number);
  const date = year && month && day ? new Date(year, month - 1, day) : new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return <View>
    <Action secondary label={open ? "Fechar calendário" : "Escolher no calendário"} run={() => setOpen(!open)} />
    {open && <NativePicker value={date < tomorrow ? tomorrow : date} minimumDate={tomorrow} mode="date"
      onChange={(event, selected) => {
        if (Platform.OS === "android") setOpen(false);
        if (event.type !== "set" || !selected) return;
        const dd = String(selected.getDate()).padStart(2, "0");
        const mm = String(selected.getMonth() + 1).padStart(2, "0");
        onChange(`${dd}/${mm}/${selected.getFullYear()}`);
      }} />}
  </View>;
}
