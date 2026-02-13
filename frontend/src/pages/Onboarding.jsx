import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, getAvatarSignature, updateProfile } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const experienceOptions = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const availabilityOptions = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "HACKATHON", label: "Hackathon" },
];

const MAX_AVATAR_MB = 2;
const MAX_AVATAR_BYTES = MAX_AVATAR_MB * 1024 * 1024;
const MAX_CANVAS_SIZE = 512;

const dataUrlSizeInBytes = (dataUrl) => {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.floor((base64.length * 3) / 4);
};

const resizeImageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(
          1,
          MAX_CANVAS_SIZE / Math.max(image.width, image.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to process image"));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      };

      image.onerror = () => reject(new Error("Invalid image file"));
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

const dataUrlToBlob = (dataUrl) => {
  const [meta, base64] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: "",
    skills: [],
    experienceLevel: "BEGINNER",
    availability: "PART_TIME",
    githubLink: "",
    avatar: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await fetchMe();
        if (!isMounted) return;

        const user = data?.user;
        if (user) {
          setForm({
            bio: user.bio || "",
            skills: user.skills || [],
            experienceLevel: user.experienceLevel || "BEGINNER",
            availability: user.availability || "PART_TIME",
            githubLink: user.githubLink || "",
            avatar: user.avatar || "",
          });
          setAvatarPreview(user.avatar || "");
          setAvatarDataUrl("");
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;

    const exists = form.skills.some(
      (skill) => skill.toLowerCase() === nextSkill.toLowerCase(),
    );
    if (exists) {
      setSkillInput("");
      return;
    }

    setForm((prev) => ({ ...prev, skills: [...prev.skills, nextSkill] }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const handleAvatarFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > MAX_AVATAR_BYTES) {
      setError(`Avatar must be under ${MAX_AVATAR_MB}MB.`);
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      if (dataUrlSizeInBytes(dataUrl) > MAX_AVATAR_BYTES) {
        setError(`Avatar must be under ${MAX_AVATAR_MB}MB after resize.`);
        return;
      }
      setAvatarDataUrl(dataUrl);
      setAvatarPreview(dataUrl);
    } catch (err) {
      setError(err.message || "Failed to process avatar.");
    }
  };

  const uploadAvatarToCloudinary = async (dataUrl) => {
    const { timestamp, signature, folder, apiKey, cloudName } =
      await getAvatarSignature();

    const formData = new FormData();
    formData.append("file", dataUrlToBlob(dataUrl));
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Avatar upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      let avatarUrl = form.avatar;
      if (avatarDataUrl) {
        avatarUrl = await uploadAvatarToCloudinary(avatarDataUrl);
      }

      await updateProfile({ ...form, avatar: avatarUrl });
      setSuccess("Profile updated. You are ready to start matching.");
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Finish your profile</h1>
          <p className="text-muted-foreground">
            Tell us about your skills and availability so we can match you with
            the right developers.
          </p>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Bio</h2>
              <p className="text-sm text-muted-foreground">
                Share what you are building or learning right now.
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                placeholder="I love building real-time apps with Node and React..."
                value={form.bio}
                onChange={handleFieldChange("bio")}
                rows={4}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Skills</h2>
              <p className="text-sm text-muted-foreground">
                Add the technologies you want to collaborate on.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {form.skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills added yet.
                </p>
              ) : (
                form.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                    <button
                      type="button"
                      className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="skills">Add a skill</Label>
                <Input
                  id="skills"
                  placeholder="React, Node, Figma"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSkill}
              >
                Add skill
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                Experience & availability
              </h2>
              <p className="text-sm text-muted-foreground">
                Let matches know your level and time commitment.
              </p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Experience level</Label>
                <Select
                  value={form.experienceLevel}
                  onValueChange={handleSelectChange("experienceLevel")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={form.availability}
                  onValueChange={handleSelectChange("availability")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">GitHub & avatar</h2>
              <p className="text-sm text-muted-foreground">
                Add a GitHub link and upload a profile photo.
              </p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="githubLink">GitHub profile</Label>
                  <Input
                    id="githubLink"
                    type="url"
                    placeholder="https://github.com/username"
                    value={form.githubLink}
                    onChange={handleFieldChange("githubLink")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarFile">Avatar upload</Label>
                  <Input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                      Upload
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG or JPG up to {MAX_AVATAR_MB}MB.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? (
            <p className="text-sm text-emerald-600">{success}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/feed")}
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : "Save and continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
