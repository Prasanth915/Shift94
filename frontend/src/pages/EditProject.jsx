import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, X, Upload } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import projectService from '../services/project.service.js';

export const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await projectService.delete(id);
      toast.success('Project deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete project.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // File Upload State
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Tech Stack state
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState([]);

  // Tag state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load existing project details
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await projectService.getById(id);
        const p = response.data.project;
        setProjectTitle(p.title);
        setValue('title', p.title);
        setValue('subtitle', p.subtitle || '');
        setValue('description', p.description);
        setValue('githubUrl', p.githubUrl || '');
        setValue('demoUrl', p.demoUrl || '');

        setTechStack(p.techStack || []);
        setTags(p.tags || []);
        if (p.image) {
          setImagePreview(p.image);
        }
      } catch (err) {
        toast.error('Failed to load project details.');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };

    loadProject();
  }, [id, setValue, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (item) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (item) => {
    setTags(tags.filter((t) => t !== item));
  };

  const onSubmit = async (data) => {
    if (techStack.length === 0) {
      toast.error('Please add at least one technology to the tech stack.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle || '');
      formData.append('description', data.description);
      formData.append('githubUrl', data.githubUrl || '');
      formData.append('demoUrl', data.demoUrl || '');
      formData.append('techStack', JSON.stringify(techStack));
      formData.append('tags', JSON.stringify(tags));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (!imagePreview) {
        // If image was removed
        formData.append('image', '');
      }

      await projectService.update(id, formData);
      toast.success('Project showcase updated successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 font-display">Edit Project Showcase</h1>
          <p className="text-xs text-zinc-400 mt-1">Update your project showcase details.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <Input
                  label="Project Title *"
                  placeholder="e.g. Shift 9"
                  error={errors.title?.message}
                  {...register('title', { required: 'Title is required' })}
                />

                <Input
                  label="Subtitle"
                  placeholder="e.g. Developer Portfolio Automation Platform"
                  error={errors.subtitle?.message}
                  {...register('subtitle')}
                />

                <Textarea
                  label="Description *"
                  placeholder="Describe your project, the problem it solves, and its core features..."
                  error={errors.description?.message}
                  {...register('description', { required: 'Description is required' })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 pt-4">
                <Input
                  label="GitHub Repository URL"
                  placeholder="https://github.com/username/repo"
                  error={errors.githubUrl?.message}
                  {...register('githubUrl')}
                />

                <Input
                  label="Live Demo URL"
                  placeholder="https://yourproject.com"
                  error={errors.demoUrl?.message}
                  {...register('demoUrl')}
                />

                {/* Tech Stack Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 block">Tech Stack *</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. React"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTech();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTech}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                      >
                        {tech}
                        <button type="button" onClick={() => removeTech(tech)}>
                          <X className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 block">Tags / Hashtags</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. open-source"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                      >
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <label className="text-xs font-medium text-zinc-400 block">Cover Image</label>
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg aspect-video cursor-pointer hover:border-zinc-700 hover:bg-zinc-950/20 transition duration-150">
                    <Upload className="h-5 w-5 text-zinc-500 mb-1" />
                    <span className="text-xs text-zinc-400">Upload cover image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Save Updates
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/40"
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </form>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md animate-scale-in">
            <h3 className="text-lg font-semibold text-white font-display">Delete Project?</h3>
            <p className="text-xs text-zinc-400 mt-2">
              Are you sure you want to delete <span className="font-semibold text-zinc-200">"{projectTitle}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white border-none hover:text-white"
                onClick={handleDelete}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EditProject;
