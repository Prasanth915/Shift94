import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUpload from './ImageUpload';
import TechStackInput from './TechStackInput';
import PlatformSelector from './PlatformSelector';
import { FileText, Link as LinkIcon, AlignLeft } from 'lucide-react';

export default function ProjectForm({
  onSubmit,
  loading = false,
  defaultValues = {},
  submitLabel = 'Create Project',
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      liveUrl: '',
      repoUrl: '',
      techStack: [],
      platforms: [],
      coverImage: null,
      ...defaultValues,
    },
  });

  const techStack = watch('techStack') || [];
  const platforms = watch('platforms') || [];
  const coverImage = watch('coverImage');

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.liveUrl) formData.append('liveUrl', data.liveUrl);
    if (data.repoUrl) formData.append('repoUrl', data.repoUrl);
    formData.append('techStack', JSON.stringify(data.techStack));
    formData.append('platforms', JSON.stringify(data.platforms));
    if (data.coverImage instanceof File) {
      formData.append('coverImage', data.coverImage);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Cover Image
        </label>
        <ImageUpload
          value={coverImage}
          onChange={(file) => setValue('coverImage', file)}
        />
      </div>

      {/* Title */}
      <Input
        label="Project Title"
        placeholder="My Awesome Project"
        icon={FileText}
        error={errors.title?.message}
        {...register('title', {
          required: 'Title is required',
          minLength: { value: 2, message: 'Title must be at least 2 characters' },
          maxLength: { value: 100, message: 'Title must be under 100 characters' },
        })}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Description
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-zinc-400 pointer-events-none">
            <AlignLeft className="w-4 h-4" />
          </div>
          <textarea
            placeholder="Describe your project, what it does, and what makes it special..."
            rows={4}
            className={`
              w-full px-3 py-2.5 pl-10 text-sm text-zinc-900 placeholder-zinc-400
              bg-white border border-zinc-200 rounded-xl
              transition-all duration-200 ease-out resize-none
              hover:border-zinc-300
              focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900
              ${errors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}
            `}
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
              maxLength: { value: 2000, message: 'Description must be under 2000 characters' },
            })}
          />
        </div>
        {errors.description && (
          <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Live URL"
          placeholder="https://myproject.com"
          icon={LinkIcon}
          error={errors.liveUrl?.message}
          {...register('liveUrl', {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
              message: 'Enter a valid URL',
            },
          })}
        />
        <Input
          label="Repository URL"
          placeholder="https://github.com/user/repo"
          icon={LinkIcon}
          error={errors.repoUrl?.message}
          {...register('repoUrl', {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
              message: 'Enter a valid URL',
            },
          })}
        />
      </div>

      {/* Tech Stack */}
      <TechStackInput
        value={techStack}
        onChange={(tags) => setValue('techStack', tags)}
      />

      {/* Platform Selector */}
      <PlatformSelector
        value={platforms}
        onChange={(selected) => setValue('platforms', selected)}
      />

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-zinc-100">
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
