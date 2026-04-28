import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, Heart, Loader2 } from "lucide-react";

export default function IslandGallery({ currentSeed }) {
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["island-submissions"],
    queryFn: () => base44.entities.IslandSubmission.list("-created_date", 20),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (selectedFiles.length === 0) return;
      setIsUploading(true);
      try {
        for (const file of selectedFiles) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          await base44.entities.IslandSubmission.create({
            image_url: file_url,
            description: description || "An island I made",
            seed: currentSeed || "unknown",
          });
        }
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["island-submissions"] });
      setDescription("");
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const likeMutation = useMutation({
    mutationFn: (submission) =>
      base44.entities.IslandSubmission.update(submission.id, {
        likes: submission.likes + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["island-submissions"] });
    },
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-card rounded-2xl shadow-sm ring-1 ring-border/40 p-4 md:p-5">
        <h2 className="font-nunito font-bold text-lg text-foreground mb-4">
          Island Gallery
        </h2>

        {/* Upload Section */}
        <div className="space-y-3 mb-6 pb-6 border-b border-border/40">
          <p className="text-sm text-muted-foreground font-nunito">
            Share your island with the community (anonymous)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Previews Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => removePreview(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full h-10 font-nunito rounded-xl border-dashed"
          >
            <Upload className="w-4 h-4 mr-2" />
            Add {previews.length > 0 ? "more " : ""}images
          </Button>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your island..."
            maxLength={100}
            className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-sm font-nunito text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />

          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-nunito font-semibold rounded-xl"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting {selectedFiles.length} {selectedFiles.length === 1 ? "island" : "islands"}...
              </>
            ) : (
              `Post ${selectedFiles.length} ${selectedFiles.length === 1 ? "Island" : "Islands"}`
            )}
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground font-nunito col-span-full text-center py-6">
              Loading submissions...
            </p>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground font-nunito col-span-full text-center py-6">
              No islands yet. Be the first to share!
            </p>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="group rounded-xl overflow-hidden bg-muted/20 border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={sub.image_url}
                    alt={sub.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-3 space-y-2">
                  {sub.description && (
                    <p className="text-xs font-nunito text-muted-foreground line-clamp-2">
                      {sub.description}
                    </p>
                  )}

                  {sub.seed !== "unknown" && (
                    <p className="text-xs font-nunito text-muted-foreground/70">
                      Seed: {sub.seed}
                    </p>
                  )}

                  <button
                    onClick={() => likeMutation.mutate(sub)}
                    disabled={likeMutation.isPending}
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-sm font-nunito font-semibold text-foreground"
                  >
                    <Heart className="w-4 h-4" />
                    {sub.likes}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}