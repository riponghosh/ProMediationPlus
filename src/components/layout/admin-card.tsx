import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useMobileStyling } from "@/lib/mobileStyling";

interface AdminCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showSaveButton?: boolean;
  onSave?: () => void;
  saveButtonText?: string;
  saveButtonDisabled?: boolean;
  saveButtonLoading?: boolean;
}

export function AdminCard({
  title,
  description,
  icon,
  children,
  footer,
  showSaveButton = false,
  onSave,
  saveButtonText = "Save Changes",
  saveButtonDisabled = false,
  saveButtonLoading = false
}: AdminCardProps) {
  const { cardStyles, iconSizes, buttonStyles } = useMobileStyling();
  
  return (
    <Card>
      <CardHeader className={cardStyles.header}>
        <CardTitle className={`flex items-center gap-2 ${cardStyles.title}`}>
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription className={cardStyles.description}>{description}</CardDescription>}
      </CardHeader>

      <CardContent className={cardStyles.content}>
        {children}
      </CardContent>

      {(showSaveButton || footer) && (
        <CardFooter className={cardStyles.footer}>
          {footer || (
            <Button 
              onClick={onSave} 
              disabled={saveButtonDisabled || saveButtonLoading}
              className={buttonStyles.standard}
            >
              {saveButtonLoading ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className={iconSizes.button} />
                  {saveButtonText}
                </>
              )}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}