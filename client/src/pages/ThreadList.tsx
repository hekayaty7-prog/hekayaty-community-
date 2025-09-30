import { useState } from "react";
import { useThreads } from "@/hooks/useThreads";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ThreadList() {
  const { data: threads, isLoading } = useThreads();
  const [filter, setFilter] = useState("");

  const visible = threads?.filter(
    (t) =>
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.content.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Community Discussions</h1>
      <Input
        placeholder="Search threads…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {isLoading && <p>Loading…</p>}
      <ul className="space-y-4">
        {visible?.map((thread) => (
          <li
            key={thread.id}
            className="p-4 rounded-lg bg-card text-card-foreground hover:bg-secondary transition"
          >
            <Link href={`/threads/${thread.id}`} className="font-semibold text-primary">
              {thread.title}
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {thread.content}
            </p>
            
            {/* Display thread images */}
            {thread.images && thread.images.length > 0 && (
              <div className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {thread.images.slice(0, 3).map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Thread image ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      {/* Show "+X more" overlay for additional images */}
                      {index === 2 && thread.images!.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            +{thread.images!.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Button asChild>
        <Link href="/threads/new">Create Thread</Link>
      </Button>
    </div>
  );
}
