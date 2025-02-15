import React from "react";

export function Input({ type = "text", ...props }) {
    return <input type={type} className="border p-2 rounded" {...props} />;
}
