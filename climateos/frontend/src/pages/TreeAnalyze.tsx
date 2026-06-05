import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, TreePine, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { TreeAnalysisResult } from '@/components/trees/TreeAnalysisResult';
import { api } from '@/services/api';

export function TreeAnalyze() {
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ farmerId: '', county: '', landAcres: '', location: '', notes: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (fd: FormData) => api.analyzeTree(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treeHistory'] });
      queryClient.invalidateQueries({ queryKey: ['treeQuota'] });
    },
  });

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);
    if (form.farmerId) fd.append('farmerId', form.farmerId);
    if (form.county) fd.append('county', form.county);
    if (form.landAcres) fd.append('landAcres', form.landAcres);
    if (form.location) fd.append('location', form.location);
    if (form.notes) fd.append('notes', form.notes);

    mutation.mutate(fd);
  };

  const result = mutation.data;

  return (
    <div>
      <Header title="Tree Analysis" subtitle="Upload aerial or field images for forestry analytics" />

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  if (fileRef.current) fileRef.current.files = dt.files;
                  handleFile(file);
                }
              }}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:border-accent/40 hover:bg-accent/5"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-xl object-cover" />
              ) : (
                <>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10"
                  >
                    <Upload className="h-8 w-8 text-accent" />
                  </motion.div>
                  <p className="font-medium">Drop image here or click to browse</p>
                  <p className="mt-1 text-xs text-white/40">JPEG, PNG, WEBP — max 20MB</p>
                </>
              )}
            </div>

            <input className="input-field" placeholder="Farmer ID (optional)" value={form.farmerId} onChange={(e) => setForm({ ...form, farmerId: e.target.value })} />
            <input className="input-field" placeholder="County / Region" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
            <input className="input-field" placeholder="Land size (acres)" type="number" step="any" value={form.landAcres} onChange={(e) => setForm({ ...form, landAcres: e.target.value })} />
            <input className="input-field" placeholder="Location name" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <textarea className="input-field min-h-[80px] resize-none" placeholder="Notes for context..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
              {mutation.isPending ? (
                <><Sparkles className="h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><TreePine className="h-4 w-4" /> Run Analysis</>
              )}
            </button>
          </form>
        </AnimatedCard>

        <div className="space-y-6">
          {mutation.isError && (
            <ErrorState message={(mutation.error as Error)?.message} onRetry={() => mutation.reset()} />
          )}

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.analysis_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <TreeAnalysisResult result={result} />
              </motion.div>
            )}

            {!result && !mutation.isPending && !mutation.isError && (
              <AnimatedCard className="flex flex-col items-center justify-center p-12 text-center">
                <ImageIcon className="mb-4 h-12 w-12 text-white/20" />
                <p className="text-white/50">Upload an image to see analysis results</p>
              </AnimatedCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
