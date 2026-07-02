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
import oauthService from '../services/oauth.service.js';
import { Select } from '../components/ui/Select.jsx';

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

  // Repository Creation Sub-Form State
  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [repoMode, setRepoMode] = useState('SELECT');
  const [githubUsername, setGithubUsername] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [newRepoAutoInit, setNewRepoAutoInit] = useState(true);
  const [newRepoGitignore, setNewRepoGitignore] = useState('Node');
  const [newRepoLicense, setNewRepoLicense] = useState('mit');
  const [newRepoTopics, setNewRepoTopics] = useState('shift94, portfolio, developer');

  // Validation States
  const [repoNameManuallyEdited, setRepoNameManuallyEdited] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameCheckResult, setNameCheckResult] = useState(null);
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [repositoriesRaw, setRepositoriesRaw] = useState([]);

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
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      githubUrl: '',
      sourceRepository: null,
    }
  });

  // Load existing project details and connections
  useEffect(() => {
    const loadProjectAndConnections = async () => {
      try {
        const [projRes, ghRes] = await Promise.all([
          projectService.getById(id),
          oauthService.getStatus('GITHUB'),
        ]);

        const p = projRes.data.project;
        setProjectTitle(p.title);
        setValue('title', p.title);
        setValue('subtitle', p.subtitle || '');
        setValue('description', p.description);
        setValue('githubUrl', p.githubUrl || '');
        setValue('demoUrl', p.demoUrl || '');
        if (p.sourceRepository) {
          setValue('sourceRepository', typeof p.sourceRepository === 'string'
            ? p.sourceRepository
            : JSON.stringify(p.sourceRepository)
          );
        }

        setTechStack(p.techStack || []);
        setTags(p.tags || []);
        if (p.image) {
          setImagePreview(p.image);
        }

        const ghActive = ghRes.data.connected;
        setGithubConnected(ghActive);

        if (ghActive) {
          setGithubUsername(ghRes.data.account?.username || '');
          setFetchingRepos(true);
          const repoRes = await oauthService.getRepositories();
          setRepositoriesRaw(repoRes.data.repositories);
          setRepositories(
            repoRes.data.repositories.map((r) => ({
              label: r.fullName,
              value: r.url,
            }))
          );
        }
      } catch (err) {
        toast.error('Failed to load project details or connections.');
        navigate('/dashboard');
      } finally {
        setFetching(false);
        setFetchingRepos(false);
      }
    };

    loadProjectAndConnections();
  }, [id, setValue, navigate]);

  const projectTitleVal = watch('title') || '';
  const projectSubtitle = watch('subtitle') || '';
  const projectDesc = watch('description') || '';

  // Auto-slugify title to repo name
  useEffect(() => {
    if (repoMode === 'CREATE' && !repoNameManuallyEdited && projectTitleVal) {
      const slug = projectTitleVal
        .toLowerCase()
        .replace(/[^a-z0-9_.-]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setNewRepoName(slug);
    }
  }, [projectTitleVal, repoMode, repoNameManuallyEdited]);

  // Auto-populate description
  useEffect(() => {
    if (repoMode === 'CREATE') {
      setNewRepoDescription(projectSubtitle || projectDesc || '');
    }
  }, [projectSubtitle, projectDesc, repoMode]);

  // Debounced Repository Name Availability Check
  useEffect(() => {
    if (!newRepoName || newRepoName.trim() === '') {
      setNameCheckResult(null);
      return;
    }

    if (!/^[a-z0-9_.-]+$/i.test(newRepoName)) {
      setNameCheckResult({ available: false, reason: 'INVALID_NAME' });
      return;
    }

    setIsCheckingName(true);
    setNameCheckResult(null);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await oauthService.checkRepositoryName(newRepoName);
        if (res.success) {
          if (res.data.available) {
            setNameCheckResult({ available: true });
          } else {
            setNameCheckResult({ available: false, reason: 'ALREADY_EXISTS' });
          }
        }
      } catch (err) {
        setNameCheckResult({ available: false, error: err.message || 'Check failed.' });
      } finally {
        setIsCheckingName(false);
      }
    }, 650);

    return () => clearTimeout(delayDebounce);
  }, [newRepoName]);

  const GITIGNORE_TEMPLATES = [
    { label: 'None', value: '' },
    { label: 'Node.js', value: 'Node' },
    { label: 'React / Yeoman', value: 'Yeoman' },
    { label: 'Maven / Java', value: 'Maven' },
    { label: 'Gradle', value: 'Gradle' },
    { label: 'Python', value: 'Python' },
    { label: 'Go', value: 'Go' },
    { label: 'Rust', value: 'Rust' },
    { label: 'C++', value: 'C++' },
    { label: 'VisualStudio', value: 'VisualStudio' }
  ];

  const LICENSE_TEMPLATES = [
    { label: 'None', value: '' },
    { label: 'MIT License', value: 'mit' },
    { label: 'Apache 2.0', value: 'apache-2.0' },
    { label: 'GNU GPL v3', value: 'gpl-3.0' },
    { label: 'GNU AGPL v3', value: 'agpl-3.0' },
    { label: 'BSD 2-Clause', value: 'bsd-2-clause' },
    { label: 'BSD 3-Clause', value: 'bsd-3-clause' },
    { label: 'The Unlicense', value: 'unlicense' }
  ];

  const getLiveUrlPreview = () => {
    const slug = newRepoName || 'repository-name';
    const base = `https://github.com/${githubUsername || 'username'}/${slug}`;
    
    let badge = null;
    if (isCheckingName) {
      badge = <span className="text-zinc-400 text-xs italic ml-2">checking availability...</span>;
    } else if (nameCheckResult) {
      if (nameCheckResult.available) {
        badge = <span className="text-green-500 font-semibold text-xs ml-2">✓ Available</span>;
      } else if (nameCheckResult.reason === 'ALREADY_EXISTS') {
        badge = <span className="text-amber-500 font-semibold text-xs ml-2">⚠ Repository already exists</span>;
      } else if (nameCheckResult.reason === 'INVALID_NAME') {
        badge = <span className="text-rose-500 font-semibold text-xs ml-2">⚠ Invalid repository name</span>;
      } else {
        badge = <span className="text-rose-400 text-xs ml-2">⚠ Check failed: {nameCheckResult.error}</span>;
      }
    }

    return (
      <div className="text-xs text-zinc-400 mt-1 flex items-center flex-wrap">
        <span>Preview: <a href={base} target="_blank" rel="noreferrer" className="underline font-mono text-zinc-300">{base}</a></span>
        {badge}
      </div>
    );
  };

  const handleCreateRepository = async (e) => {
    e.preventDefault();
    if (!newRepoName || newRepoName.trim() === '') {
      toast.error('Repository name is required.');
      return;
    }

    if (nameCheckResult && !nameCheckResult.available && nameCheckResult.reason === 'ALREADY_EXISTS') {
      toast.error('Repository already exists. Choose another name or use existing.');
      return;
    }

    setCreatingRepo(true);
    try {
      const topicsArray = newRepoTopics
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const res = await oauthService.createRepository({
        name: newRepoName.trim(),
        description: newRepoDescription,
        private: newRepoPrivate,
        autoInit: newRepoAutoInit,
        gitignoreTemplate: newRepoGitignore || undefined,
        licenseTemplate: newRepoLicense || undefined,
        topics: topicsArray,
      });

      if (res.success) {
        toast.success(`Repository '${res.data.repository.name}' created successfully!`);
        
        const metadata = {
          provider: 'github',
          id: res.data.repository.id,
          owner: res.data.repository.owner,
          name: res.data.repository.name,
          url: res.data.repository.url,
          visibility: res.data.repository.visibility,
          defaultBranch: res.data.repository.defaultBranch,
          createdAt: res.data.repository.createdAt,
        };

        const newRepoUrl = res.data.repository.url;
        const newRepoLabel = `${res.data.repository.owner}/${res.data.repository.name}`;

        setRepositories((prev) => {
          const exists = prev.some(r => r.value === newRepoUrl);
          if (exists) return prev;
          return [{ label: newRepoLabel, value: newRepoUrl }, ...prev];
        });

        setValue('githubUrl', newRepoUrl);
        setValue('sourceRepository', JSON.stringify(metadata));

        setRepoMode('SELECT');
        setNewRepoName('');
        setNewRepoDescription('');
        setRepoNameManuallyEdited(false);

        oauthService.getRepositories().then((repoRes) => {
          setRepositoriesRaw(repoRes.data.repositories);
          const updatedRepos = repoRes.data.repositories.map((r) => ({
            label: r.fullName,
            value: r.url,
          }));
          setRepositories(updatedRepos);
        }).catch((err) => {
          console.warn('Failed to sync repo list in background:', err);
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create repository.');
    } finally {
      setCreatingRepo(false);
      setFetchingRepos(false);
    }
  };

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

      if (data.sourceRepository) {
        formData.append('sourceRepository', typeof data.sourceRepository === 'string'
          ? data.sourceRepository
          : JSON.stringify(data.sourceRepository)
        );
      }

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
                  placeholder="e.g. Shift94"
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
                {githubConnected && (
                  <div className="space-y-3">
                    <input type="hidden" {...register('githubUrl')} />
                    <input type="hidden" {...register('sourceRepository')} />
                    <label className="text-xs font-medium text-zinc-400 block font-semibold">Repository Configuration</label>
                    <div className="flex gap-4 text-sm text-zinc-300 pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="repoMode"
                          checked={repoMode === 'SELECT'}
                          onChange={() => setRepoMode('SELECT')}
                          className="accent-zinc-500"
                        />
                        Select Existing
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="repoMode"
                          checked={repoMode === 'CREATE'}
                          onChange={() => setRepoMode('CREATE')}
                          className="accent-zinc-500"
                        />
                        Create New Repository
                      </label>
                    </div>

                    <div className={repoMode === 'SELECT' ? 'block' : 'hidden'}>
                      <Select
                        label="Link GitHub Repository"
                        options={[{ label: 'Select a repository...', value: '' }, ...repositories]}
                        error={errors.githubUrl?.message}
                        value={watch('githubUrl') || ''}
                        onChange={(e) => {
                          const selectedUrl = e.target.value;
                          setValue('githubUrl', selectedUrl);

                          const matched = repositoriesRaw.find((r) => r.url === selectedUrl);
                          if (matched) {
                            const meta = {
                              provider: 'github',
                              id: matched.id,
                              owner: matched.owner?.login || matched.owner || '',
                              name: matched.name,
                              url: matched.url,
                              visibility: matched.private ? 'private' : 'public',
                              defaultBranch: matched.default_branch || 'main',
                              createdAt: matched.created_at || new Date().toISOString(),
                            };
                            setValue('sourceRepository', JSON.stringify(meta));
                          } else {
                            setValue('sourceRepository', null);
                          }
                        }}
                      />
                    </div>

                    <div className={repoMode === 'CREATE' ? 'block' : 'hidden'}>
                      <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-4">
                        <div className="text-xs font-semibold text-zinc-200">New GitHub Repository Setup</div>
                        
                        <div className="space-y-1">
                          <Input
                            label="Repository Name *"
                            placeholder="e.g. my-project-name"
                            value={newRepoName}
                            onChange={(e) => {
                              setNewRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '-'));
                              setRepoNameManuallyEdited(true);
                            }}
                          />
                          {getLiveUrlPreview()}
                        </div>

                        <Input
                          label="Description"
                          placeholder="Short repository description"
                          value={newRepoDescription}
                          onChange={(e) => setNewRepoDescription(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            label=".gitignore Template"
                            value={newRepoGitignore}
                            onChange={(e) => setNewRepoGitignore(e.target.value)}
                            options={GITIGNORE_TEMPLATES}
                          />
                          <Select
                            label="License Template"
                            value={newRepoLicense}
                            onChange={(e) => setNewRepoLicense(e.target.value)}
                            options={LICENSE_TEMPLATES}
                          />
                        </div>

                        <Input
                          label="Topics (comma-separated)"
                          placeholder="shift94, portfolio, react"
                          value={newRepoTopics}
                          onChange={(e) => setNewRepoTopics(e.target.value)}
                        />

                        <div className="flex gap-4 items-center pt-2">
                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRepoAutoInit}
                              onChange={(e) => setNewRepoAutoInit(e.target.checked)}
                              className="accent-zinc-500"
                            />
                            Initialize README
                          </label>
                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRepoPrivate}
                              onChange={(e) => setNewRepoPrivate(e.target.checked)}
                              className="accent-zinc-500"
                            />
                            Private Repository
                          </label>
                        </div>

                        {nameCheckResult && !nameCheckResult.available && nameCheckResult.reason === 'ALREADY_EXISTS' && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 space-y-2">
                            <p>This repository already exists on your GitHub account. What would you like to do?</p>
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const possibleUrl = `https://github.com/${githubUsername}/${newRepoName}`;
                                  if (!repositories.some(r => r.value === possibleUrl)) {
                                    setRepositories([...repositories, { label: `${githubUsername}/${newRepoName}`, value: possibleUrl }]);
                                  }
                                  setValue('githubUrl', possibleUrl);
                                  setRepoMode('SELECT');
                                  toast.success('Switched to select existing repository.');
                                }}
                                className="font-semibold underline text-amber-300 hover:text-white cursor-pointer"
                              >
                                Use Existing Repository
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRepoNameManuallyEdited(true);
                                }}
                                className="font-semibold underline text-amber-300 hover:text-white cursor-pointer"
                              >
                                Rename Repository
                              </button>
                            </div>
                          </div>
                        )}

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={creatingRepo || (nameCheckResult && !nameCheckResult.available)}
                          onClick={handleCreateRepository}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          {creatingRepo ? (
                            <>
                              <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-950 rounded-full animate-spin"></span>
                              Creating Repository...
                            </>
                          ) : (
                            'Create & Link Repository'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!githubConnected && (
                  <Input
                    label="GitHub Repository URL"
                    placeholder="https://github.com/username/repo"
                    error={errors.githubUrl?.message}
                    {...register('githubUrl')}
                  />
                )}

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
