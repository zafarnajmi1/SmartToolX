"use client";

import { useState } from "react";
import { deleteContactMessageAction } from "@/app/admin/actions";
import type { ContactMessage } from "@/lib/contact-messages";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageList({ messages }: { messages: ContactMessage[] }) {
  const [items, setItems] = useState(messages);

  if (items.length === 0) {
    return (
      <p className="text-text-dim text-[14px] leading-[1.6]">
        No messages yet. Submissions from the Contact Us page will appear here.
      </p>
    );
  }

  return (
    <div className="grid max-w-[720px] gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="border-line bg-surface rounded-[8px] border p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-display text-[15px] font-semibold">
                {item.name}
              </div>
              <a
                href={`mailto:${item.email}`}
                className="text-steel mt-1 block font-mono text-[13px]"
              >
                {item.email}
              </a>
            </div>
            <div className="text-text-dim font-mono text-[12px]">
              {formatDate(item.createdAt)}
            </div>
          </div>
          <p className="text-text-dim mt-4 whitespace-pre-wrap text-[14px] leading-[1.6]">
            {item.message}
          </p>
          <button
            type="button"
            className="text-text-dim hover:text-text mt-4 font-mono text-[12px]"
            onClick={() => {
              void deleteContactMessageAction(item.id).then(() => {
                setItems((prev) => prev.filter((entry) => entry.id !== item.id));
              });
            }}
          >
            Delete
          </button>
        </article>
      ))}
    </div>
  );
}
