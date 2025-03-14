import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * TimeZone interface defining the structure for timezone data
 */
interface TimeZone {
  value: string
  label: string
}

/**
 * Region interface defining the structure for grouped timezone data
 */
interface Region {
  name: string
  timezones: TimeZone[]
}

/**
 * SelectScrollable Component
 * 
 * A timezone selector component that displays a scrollable list of timezones grouped by regions.
 * 
 * Features:
 * - Grouped timezones by geographical regions
 * - Accessible select interface with proper ARIA labels
 * - Scrollable content for better UX with large datasets
 * - Semantic grouping with proper labeling
 * 
 * @component
 */
export function SelectScrollable() {
  // Memoized timezone data to prevent unnecessary recreations
  const regions = React.useMemo<Region[]>(() => [
    {
      name: "North America",
      timezones: [
        { value: "est", label: "Eastern Standard Time (EST)" },
        { value: "cst", label: "Central Standard Time (CST)" },
        { value: "mst", label: "Mountain Standard Time (MST)" },
        { value: "pst", label: "Pacific Standard Time (PST)" },
        { value: "akst", label: "Alaska Standard Time (AKST)" },
        { value: "hst", label: "Hawaii Standard Time (HST)" },
      ],
    },
    {
      name: "Europe & Africa",
      timezones: [
        { value: "gmt", label: "Greenwich Mean Time (GMT)" },
        { value: "cet", label: "Central European Time (CET)" },
        { value: "eet", label: "Eastern European Time (EET)" },
        { value: "west", label: "Western European Summer Time (WEST)" },
        { value: "cat", label: "Central Africa Time (CAT)" },
        { value: "eat", label: "East Africa Time (EAT)" },
      ],
    },
    {
      name: "Asia",
      timezones: [
        { value: "msk", label: "Moscow Time (MSK)" },
        { value: "ist", label: "India Standard Time (IST)" },
        { value: "cst_china", label: "China Standard Time (CST)" },
        { value: "jst", label: "Japan Standard Time (JST)" },
        { value: "kst", label: "Korea Standard Time (KST)" },
        { value: "ist_indonesia", label: "Indonesia Central Standard Time (WITA)" },
      ],
    },
    {
      name: "Australia & Pacific",
      timezones: [
        { value: "awst", label: "Australian Western Standard Time (AWST)" },
        { value: "acst", label: "Australian Central Standard Time (ACST)" },
        { value: "aest", label: "Australian Eastern Standard Time (AEST)" },
        { value: "nzst", label: "New Zealand Standard Time (NZST)" },
        { value: "fjt", label: "Fiji Time (FJT)" },
      ],
    },
    {
      name: "South America",
      timezones: [
        { value: "art", label: "Argentina Time (ART)" },
        { value: "bot", label: "Bolivia Time (BOT)" },
        { value: "brt", label: "Brasilia Time (BRT)" },
        { value: "clt", label: "Chile Standard Time (CLT)" },
      ],
    },
  ], [])

  return (
    <Select>
      <SelectTrigger 
        className="w-[280px]"
        aria-label="Select timezone"
      >
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectGroup key={region.name}>
            <SelectLabel>{region.name}</SelectLabel>
            {region.timezones.map((timezone) => (
              <SelectItem 
                key={timezone.value} 
                value={timezone.value}
                aria-label={timezone.label}
              >
                {timezone.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
