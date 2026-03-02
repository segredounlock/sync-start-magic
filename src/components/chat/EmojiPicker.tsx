import { useState } from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: "😀", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🫢", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴", "😵", "🤯", "🥳", "🥸", "😎", "🤓", "🧐"] },
  { label: "❤️", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"] },
  { label: "👋", emojis: ["👋", "🤚", "🖐", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏"] },
  { label: "🎉", emojis: ["🎉", "🎊", "🎈", "🎁", "🎂", "🍰", "🧁", "🥂", "🍾", "🎆", "🎇", "✨", "🎄", "🎃", "👻", "💀", "☠️", "🔥", "💥", "⭐", "🌟", "💫", "🌈", "☀️", "🌤", "⛅", "🌥", "☁️", "🌧", "⛈", "🌩", "❄️", "💨", "🌊"] },
];

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-card p-3">
      {/* Category tabs */}
      <div className="flex gap-1 mb-2 border-b border-border pb-2">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`p-1.5 rounded-lg text-base transition-colors ${activeTab === i ? "bg-primary/15" : "hover:bg-muted/50"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-1 max-h-[180px] overflow-y-auto">
        {EMOJI_CATEGORIES[activeTab].emojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-xl p-1 rounded-lg hover:bg-muted/50 hover:scale-110 transition-all"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
