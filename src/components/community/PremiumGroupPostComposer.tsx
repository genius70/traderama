import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
// import YouTube icon
import { Youtube } from "lucide-react";

interface PremiumGroupPostComposerProps {
  groupId: string;
  onPost?: () => void;
}

export default function PremiumGroupPostComposer({ groupId, onPost }: PremiumGroupPostComposerProps) {
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [background, setBackground] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit() {
    setPosting(true);
    // Placeholder: should upload image and/or YouTube/embed, submit post to backend
    setTimeout(() => {
      toast({ title: "Premium post created successfully!" });
      setContent("");
      setYoutubeUrl("");
      setShowYoutubeInput(false);
      setBackground("");
      setImage(null);
      setImagePreview(null);
      setPosting(false);
      onPost?.();
    }, 1200);
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share something premium with your group..."
        className={`mb-3`}
        style={{ background: background || undefined }}
        rows={3}
      />
      {showYoutubeInput ? (
        <div className="flex items-center gap-2 mb-3">
          <Input
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube URL"
          />
          <Button variant="ghost" size="sm" onClick={() => setShowYoutubeInput(false)}>✕</Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mb-3 mr-2"
          onClick={() => setShowYoutubeInput(true)}
        >
          <Youtube className="mr-2 h-4 w-4" />Embed YouTube
        </Button>
      )}
      {youtubeUrl && (
        <div className="mb-3">
          <iframe
            width="320"
            height="180"
            src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded"
          />
        </div>
      )}
      <div className="flex gap-2 mb-3">
        <Input
          type="color"
          value={background || "#ffffff"}
          onChange={e => setBackground(e.target.value)}
          aria-label="Post Background"
          className="!p-1 h-8 w-14 border cursor-pointer"
        />
        <label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button type="button" variant="outline" size="sm">📷 Add image</Button>
        </label>
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="ml-2 w-16 h-16 object-cover rounded shadow" />
        )}
      </div>
      <Button onClick={handleSubmit} disabled={posting || !content.trim()} className="w-full">
        {posting ? "Posting..." : "Post"}
      </Button>
    </div>
  );
}

function getYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|watch)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}
