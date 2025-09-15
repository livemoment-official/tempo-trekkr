import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Upload, ArrowLeft } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { StaffProfile } from '@/hooks/useUserProfiles';

const staffSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  role: z.string().min(1, 'Il ruolo è obbligatorio'),
  bio: z.string().optional(),
  experience_years: z.number().min(0, 'Gli anni di esperienza non possono essere negativi').optional(),
  skills: z.array(z.string()).optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface CreateStaffProfileProps {
  onSubmit: (data: Omit<StaffProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const staffRoles = [
  'Manager Eventi',
  'Tecnico Audio',
  'Tecnico Luci',
  'Fotografo',
  'Videomaker',
  'Addetto Sicurezza',
  'Barman',
  'Cameriere',
  'Hostess/Steward',
  'DJ',
  'Animatore',
  'Coordinatore',
  'Altro'
];

const commonSkills = [
  'Gestione eventi', 'Mixaggio audio', 'Illuminotecnica', 'Fotografia evento',
  'Video editing', 'Sicurezza eventi', 'Bartending', 'Servizio clienti',
  'Animazione', 'Coordinamento', 'Problem solving', 'Lavoro di squadra',
  'Comunicazione', 'Puntualità', 'Flessibilità', 'Creatività'
];

export function CreateStaffProfile({ onSubmit, onCancel, loading }: CreateStaffProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  const { uploadImage, isUploading } = useImageUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      skills: []
    }
  });

  const handleAvatarUpload = async (file: File) => {
    const url = await uploadImage(file, { bucket: 'avatars' });
    if (url) {
      setAvatarUrl(url);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      const updatedSkills = [...skills, skill];
      setSkills(updatedSkills);
      setValue('skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    const updatedSkills = skills.filter(s => s !== skill);
    setSkills(updatedSkills);
    setValue('skills', updatedSkills);
  };

  const onFormSubmit = async (data: StaffFormData) => {
    await onSubmit({
      name: data.name,
      role: selectedRole,
      bio: data.bio,
      experience_years: data.experience_years,
      avatar_url: avatarUrl,
      skills: skills.length > 0 ? skills : undefined,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Crea Profilo Staff</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                <Upload className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
                className="hidden"
                id="avatar-upload"
              />
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Caricamento...' : 'Carica foto'}
              </Label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Il tuo nome completo"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Ruolo *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il tuo ruolo principale" />
                </SelectTrigger>
                <SelectContent>
                  {staffRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedRole && (
                <p className="text-sm text-destructive mt-1">Il ruolo è obbligatorio</p>
              )}
            </div>

            <div>
              <Label htmlFor="experience_years">Anni di esperienza</Label>
              <Input
                id="experience_years"
                type="number"
                {...register('experience_years', { valueAsNumber: true })}
                placeholder="Quanti anni di esperienza hai?"
              />
              {errors.experience_years && (
                <p className="text-sm text-destructive mt-1">{errors.experience_years.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Descrizione</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Racconta della tua esperienza e cosa ti distingue..."
                rows={4}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <Label>Competenze</Label>
            
            {/* Selected skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Add custom skill */}
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Aggiungi competenza"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(newSkill);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill(newSkill)}
                disabled={!newSkill}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common skills */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competenze comuni:</p>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => addSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || isUploading || !selectedRole}>
              {loading ? 'Creazione...' : 'Crea Profilo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}