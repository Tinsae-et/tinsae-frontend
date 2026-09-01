"use client"

import React, { useState } from 'react'
import { Icon } from '../tinsae/icon';



function SearchBar() {
    const [query, setQuery] = useState("");
  return (
    <div className="mt-8 flex items-stretch overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-1 items-center gap-3 pl-5">
            <Icon name='search' className="h-5 w-5 shrink-0 text-neutral-400" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full py-4 text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
            />
        </div>
        <button className="shrink-0 bg-orange-600 px-8 text-base font-semibold text-white hover:bg-orange-700">
            Search
        </button>
    </div>
  )
}

export default SearchBar