import { useParams, Link } from "wouter";
import { useThread, useComments } from "@/hooks/useThreads";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const threadQuery = useThread(id);
  const comments = useComments(id);
  const [text, setText] = useState("");

  const add = async () => {
    await comments.addComment.mutateAsync({ threadId: id, content: text, userId: "anon" });
    setText("");
  };

  if (threadQuery.isLoading) return <p>Loading…</p>;
  if (!threadQuery.data) return <p>Not found</p>;

  const t = threadQuery.data;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/threads" className="text-primary">← All Threads</Link>
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="whitespace-pre-wrap">{t.content}</p>
      
      {/* Display thread images */}
      {t.images && t.images.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.images.map((imageUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt={`Thread image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <section>
        <h2 className="font-semibold mb-2">Comments</h2>
        {comments.isLoading && <p>Loading…</p>}
        <ul className="space-y-4">
          {comments.data?.map((c) => (
            <li key={c.id} className="p-3 rounded bg-muted">
              {c.content}
            </li>
          ))}
        </ul>
        <Textarea
          className="mt-4"
          placeholder="Add a comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button className="mt-2" onClick={add} disabled={comments.addComment.isPending}>
          Comment
        </Button>
      </section>
    </div>
  );
}
