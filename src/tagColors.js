const TAG_PALETTE = {
  Math:      { bg: "#DBEAFE", text: "#1E40AF" },
  Physics:   { bg: "#D1FAE5", text: "#065F46" },
  CS:        { bg: "#EDE9FE", text: "#5B21B6" },
  Biology:   { bg: "#CCFBF1", text: "#0F766E" },
  Chemistry: { bg: "#FEF9C3", text: "#92400E" },
  History:   { bg: "#FFE4E6", text: "#9F1239" },
  English:   { bg: "#FEE2E2", text: "#991B1B" },
  Economics: { bg: "#FEF3C7", text: "#92400E" },
  PDF:       { bg: "#DBEAFE", text: "#1E3A8A" },
};

export function tagColor(tag) {
  return TAG_PALETTE[tag] || { bg: "#F3F4F6", text: "#374151" };
}
