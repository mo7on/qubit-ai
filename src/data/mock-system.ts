export interface SystemInfo {
  manufacturer: string
  model: string
  language: string
}

export interface LanguageOption {
  value: string
  label: string
}

export const mockSystemInfo: SystemInfo = {
  manufacturer: "Asus",
  model: "FL5800L",
  language: "en"
}

export const languageOptions: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" }
]