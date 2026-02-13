import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchMe,
  getAvatarSignature,
  updatePassword,
  updateProfile,
} from "@/api/user";

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

const avatarCropOptions = [
  { value: "face", label: "Face crop" },
  { value: "center", label: "Center crop" },
  { value: "fit", label: "Fit" },
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
        resolve(canvas.toDataURL("image/jpeg", 0.8));
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

const Profile = () => {
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
  const [avatarCrop, setAvatarCrop] = useState("face");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await fetchMe();
        if (!isMounted) return;
        const user = data.user;
        if (!user) return;
        setForm({
          bio: user.bio || "",
          skills: user.skills || [],
          experienceLevel: user.experienceLevel || "BEGINNER",
          availability: user.availability || "PART_TIME",
          githubLink: user.githubLink || "",
          avatar: user.avatar || "",
        });
        setAvatarPreview(user.avatar || "");
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        if (isMounted) setIsLoading(false);
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
    const { timestamp, signature, folder, apiKey, cloudName, transformation } =
      await getAvatarSignature(avatarCrop);

    const formData = new FormData();
    formData.append("file", dataUrlToBlob(dataUrl));
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("transformation", transformation);

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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = form.avatar;
      if (avatarDataUrl) {
        avatarUrl = await uploadAvatarToCloudinary(avatarDataUrl);
      }

      await updateProfile({ ...form, avatar: avatarUrl });
      setForm((prev) => ({ ...prev, avatar: avatarUrl }));
      setAvatarDataUrl("");
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsUpdatingPassword(true);
    setError("");
    setSuccess("");

    try {
      await updatePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setSuccess("Password updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AppShell
      title="Profile"
      subtitle="Keep your profile up to date for better matches."
    >
      {error ? (
        <div className="mb-4 border-4 border-destructive bg-destructive/10 p-4 font-mono text-sm text-destructive shadow-lg">
          ⚠ {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-4 border-4 border-primary bg-primary/10 p-4 font-mono text-sm text-primary shadow-lg">
          ✓ {success}
        </div>
      ) : null}

      {isLoading ? (
        <Card className="border-4 border-muted shadow-xl">
          <CardContent className="py-12 text-center">
            <p className="font-mono text-base text-muted-foreground animate-pulse">
              Loading profile...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="border-4 border-primary shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="font-mono font-bold text-foreground"
                >
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={handleFieldChange("bio")}
                  rows={4}
                  className="border-4 border-border font-mono shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono font-bold text-foreground">
                  Skills
                </Label>
                <div className="flex flex-wrap gap-2">
                  {form.skills.length === 0 ? (
                    <span className="font-mono text-sm text-muted-foreground">
                      // No skills added
                    </span>
                  ) : (
                    form.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="border-2 border-border font-mono text-xs font-semibold shadow-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          className="ml-2 text-xs font-bold hover:text-destructive"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    className="border-4 border-border font-mono shadow-md"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddSkill}
                    className="border-4 border-border font-mono font-bold shadow-lg hover:shadow-xl"
                  >
                    + Add
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono font-bold text-foreground">
                    Experience level
                  </Label>
                  <Select
                    value={form.experienceLevel}
                    onValueChange={handleSelectChange("experienceLevel")}
                  >
                    <SelectTrigger className="border-4 border-border font-mono shadow-md">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-border font-mono shadow-xl">
                      {experienceOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="font-mono"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono font-bold text-foreground">
                    Availability
                  </Label>
                  <Select
                    value={form.availability}
                    onValueChange={handleSelectChange("availability")}
                  >
                    <SelectTrigger className="border-4 border-border font-mono shadow-md">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-border font-mono shadow-xl">
                      {availabilityOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="font-mono"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="githubLink"
                  className="font-mono font-bold text-foreground"
                >
                  GitHub profile
                </Label>
                <Input
                  id="githubLink"
                  type="url"
                  value={form.githubLink}
                  onChange={handleFieldChange("githubLink")}
                  className="border-4 border-border font-mono shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-4 border-accent shadow-xl">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label className="font-mono font-bold text-foreground">
                    Avatar
                  </Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-20 w-20 overflow-hidden border-4 border-primary bg-primary/20 shadow-md"
                      style={{ imageRendering: "pixelated" }}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                          style={{ imageRendering: "pixelated" }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono text-2xl font-bold text-primary">
                          ?
                        </div>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="border-4 border-border font-mono text-xs shadow-md"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono font-bold text-foreground">
                    Avatar crop style
                  </Label>
                  <Select value={avatarCrop} onValueChange={setAvatarCrop}>
                    <SelectTrigger className="border-4 border-border font-mono shadow-md">
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-border font-mono shadow-xl">
                      {avatarCropOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="font-mono"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full border-4 border-border font-mono text-base font-bold shadow-lg hover:shadow-xl hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <img
                        src="/save.png"
                        alt="Save"
                        className="h-5 w-5"
                        style={{ imageRendering: "pixelated" }}
                      />
                      Save profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-secondary shadow-xl">
              <CardContent className="space-y-3 p-6">
                <div className="mb-2 border-b-2 border-primary pb-2">
                  <span className="font-mono text-sm font-bold uppercase text-primary flex items-center gap-2">
                    <img
                      src="/sheild.png"
                      alt="Security"
                      className="h-4 w-4"
                      style={{ imageRendering: "pixelated" }}
                    />
                    Security
                  </span>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="font-mono font-bold text-foreground"
                  >
                    Current password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(event) =>
                      setPasswords((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    className="border-4 border-border font-mono shadow-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="font-mono font-bold text-foreground"
                  >
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(event) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    className="border-4 border-border font-mono shadow-md"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePasswordChange}
                  disabled={isUpdatingPassword}
                  className="w-full border-4 border-border font-mono text-base font-bold shadow-lg hover:shadow-xl hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center gap-2"
                >
                  {isUpdatingPassword ? (
                    "Updating..."
                  ) : (
                    <>
                      <img
                        src="/key.png"
                        alt="Key"
                        className="h-5 w-5"
                        style={{ imageRendering: "pixelated" }}
                      />
                      Change password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Profile;
