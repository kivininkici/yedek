import { useState, useEffect } from "react";
import { MasterPasswordProtection } from "./MasterPasswordProtection";
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash2, Settings } from "lucide-react";

interface ProtectedKeyOperationsProps {
  onCreateKey: () => void;
  onExportKeys: () => void;
  onDeleteKey?: (keyId: string) => void;
  onManageKeys?: () => void;
  showCreateButton?: boolean;
  showExportButton?: boolean;
  showDeleteButton?: boolean;
  showManageButton?: boolean;
  className?: string;
}

export function ProtectedKeyOperations({
  onCreateKey,
  onExportKeys,
  onDeleteKey,
  onManageKeys,
  showCreateButton = true,
  showExportButton = true,
  showDeleteButton = false,
  showManageButton = false,
  className = ""
}: ProtectedKeyOperationsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProtection, setShowProtection] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleProtectedAction = (action: string, callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setPendingAction(action);
      setShowProtection(true);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowProtection(false);
    
    // Execute pending action
    if (pendingAction) {
      switch (pendingAction) {
        case 'create':
          onCreateKey();
          break;
        case 'export':
          onExportKeys();
          break;
        case 'manage':
          onManageKeys?.();
          break;
      }
      setPendingAction(null);
    }
  };

  // Check if already authenticated from session storage
  useEffect(() => {
    const authenticated = sessionStorage.getItem('masterPasswordAuth');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {showCreateButton && (
          <Button
            onClick={() => handleProtectedAction('create', onCreateKey)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="font-medium">Yeni Key</span>
          </Button>
        )}
        
        {showExportButton && (
          <Button
            onClick={() => handleProtectedAction('export', onExportKeys)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="font-medium">Toplu Key.txt</span>
          </Button>
        )}
        
        {showManageButton && (
          <Button
            onClick={() => handleProtectedAction('manage', onManageKeys!)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="font-medium">Yönet</span>
          </Button>
        )}
      </div>

      {showProtection && (
        <MasterPasswordProtection onAuthenticated={handleAuthenticated}>
          <div />
        </MasterPasswordProtection>
      )}
    </>
  );
}