import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const requestSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  offeredSkillId: z.number().min(1, "Please select a skill to offer"),
  preferredTimes: z.array(z.string()).min(1, "Please select at least one time slot"),
});

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: any;
  provider: any;
}

export default function RequestModal({ isOpen, onClose, skill, provider }: RequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userSkills } = useQuery({
    queryKey: ["/api/skills/user", user?.id],
    enabled: !!user?.id && isOpen,
    retry: false,
  });

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      message: "",
      offeredSkillId: 0,
      preferredTimes: [],
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof requestSchema>) => {
      await apiRequest("POST", "/api/swap-requests", {
        ...data,
        providerId: provider.id,
        requestedSkillId: skill.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Swap request sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests/user"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send swap request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof requestSchema>) => {
    createRequestMutation.mutate(data);
  };

  const offeredSkills = userSkills?.filter((s: any) => s.type === 'offered') || [];
  const timeSlots = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Skill Swap</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">
              Learning: {skill.name}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              from {provider.firstName} {provider.lastName}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Hi! I'd love to learn this skill from you. In exchange, I can offer..."
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offeredSkillId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill You're Offering</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a skill to offer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {offeredSkills.map((skill: any) => (
                          <SelectItem key={skill.id} value={skill.id.toString()}>
                            {skill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTimes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time Slots</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox
                            id={time}
                            checked={field.value.includes(time)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, time]
                                : field.value.filter((t) => t !== time);
                              field.onChange(newValue);
                            }}
                          />
                          <Label htmlFor={time} className="text-sm">
                            {time}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
