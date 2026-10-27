import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  Info, 
  X, 
  Link as LinkIcon 
} from 'lucide-react';
import { mediaRepository } from '../db/repositories/mediaRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { MediaRecord } from '../db/types';

export function AdminMediaPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canUpload = can('create');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaRecord | null>(null);

  // External URL Modal
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlTitle, setUrlTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [urlAlt, setUrlAlt] = useState('');

  const reloadData = () => {
    setMediaList(mediaRepository.getAll());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i++) {
        await mediaRepository.uploadFile(files[i]);
      }
      toast(`Successfully uploaded ${files.length} file(s)`, 'success');
      reloadData();
    } catch {
      toast('Failed to upload file', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddExternal = (e: FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;

    mediaRepository.addExternalMedia(
      urlTitle.trim() || 'External Media',
      externalUrl.trim(),
      urlAlt.trim() || urlTitle.trim()
    );

    toast('External media item added', 'success');
    setIsUrlModalOpen(false);
    setUrlTitle('');
    setExternalUrl('');
    setUrlAlt('');
    reloadData();
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast('Image URL copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete media item "${name}"?`)) {
      mediaRepository.deleteMedia(id);
      toast('Media item removed', 'info');
      if (selectedMedia?.id === id) setSelectedMedia(null);
      reloadData();
    }
  };

  const filteredMedia = mediaList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.altText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-[#094899]" />
            Custom Media Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Store posters, ministry banners, speaker headshots, and event flyers securely.
          </p>
        </div>

        {canUpload && (
          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <LinkIcon className="w-4 h-4 text-slate-500" />
              Add via URL
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search media by title or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredMedia.length} of {mediaList.length} items
        </span>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            No media files found. Upload an image or add an external URL to get started.
          </div>
        ) : (
          filteredMedia.map((media) => (
            <div
              key={media.id}
              onClick={() => setSelectedMedia(media)}
              className="group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:border-[#094899] hover:shadow-md transition-all flex flex-col"
            >
              <div className="aspect-square w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {media.mimeType.startsWith('image/') || media.url.startsWith('data:image') || media.url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                  <img
                    src={media.url}
                    alt={media.altText || media.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-slate-300" />
                )}

                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(media.url, media.id);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm transition-transform hover:scale-110"
                    title="Copy URL"
                  >
                    {copiedId === media.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {canUpload && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(media.id, media.name);
                      }}
                      className="p-2 bg-white/90 hover:bg-white text-rose-600 rounded-lg shadow-sm transition-transform hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-white border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate" title={media.name}>
                  {media.name}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>{media.sizeBytes ? `${Math.round(media.sizeBytes / 1024)} KB` : 'External'}</span>
                  <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* External URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#094899]" />
                Add External Image URL
              </h3>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExternal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Image Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="e.g. AIPC 2026 Promo Banner"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={urlAlt}
                  onChange={(e) => setUrlAlt(e.target.value)}
                  placeholder="Accessibility description"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              {externalUrl && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">Preview:</p>
                  <img
                    src={externalUrl}
                    alt="Preview"
                    className="max-h-32 rounded object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Add to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#094899]" />
                Media Details
              </h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="bg-slate-900/5 rounded-xl p-4 flex items-center justify-center border border-slate-200/60">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || selectedMedia.name}
                  className="max-h-72 max-w-full rounded-lg object-contain shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block">File Name</span>
                  <p className="font-medium text-slate-900 mt-0.5 truncate">{selectedMedia.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block">Uploaded By</span>
                  <p className="font-medium text-slate-900 mt-0.5 truncate">{selectedMedia.uploadedByEmail}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block">File Type</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedMedia.mimeType}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block">File Size</span>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {selectedMedia.sizeBytes ? `${(selectedMedia.sizeBytes / 1024).toFixed(1)} KB` : 'External Hosted'}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs block mb-1">
                  Public Resource URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedMedia.url}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 select-all"
                  />
                  <button
                    onClick={() => handleCopy(selectedMedia.url, selectedMedia.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copiedId === selectedMedia.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              {canUpload && (
                <button
                  onClick={() => handleDelete(selectedMedia.id, selectedMedia.name)}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Media
                </button>
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-xs font-semibold rounded-lg transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
