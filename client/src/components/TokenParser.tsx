import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Key, List, Lock, Copy, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function TokenParser() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<{
    outlooks: string[];
    tokens: string[];
    all: string[];
  }>({ outlooks: [], tokens: [], all: [] });

  const isPremium = user && (user.role === "premium" || user.role === "admin");

  const parseTokens = () => {
    if (!inputText.trim()) return;

    const lines = inputText.split('\n').filter(line => line.trim());
    const outlooks: string[] = [];
    const tokens: string[] = [];
    const all: string[] = [];

    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length === 3) {
        const [email, password, token] = parts;
        outlooks.push(`${email}:${password}`);
        tokens.push(token);
        all.push(line);
      }
    });

    setParsedData({ outlooks, tokens, all });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('message.copied'),
        description: `${type} information copied successfully`,
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExtract = (type: 'outlook' | 'token' | 'all') => {
    if (!isPremium) return;

    parseTokens();
    
    let textToCopy = "";
    let typeName = "";

    switch (type) {
      case 'outlook':
        textToCopy = parsedData.outlooks.join('\n');
        typeName = "Outlook";
        break;
      case 'token':
        textToCopy = parsedData.tokens.join('\n');
        typeName = "Token";
        break;
      case 'all':
        textToCopy = parsedData.all.join('\n');
        typeName = "All";
        break;
    }

    if (textToCopy) {
      copyToClipboard(textToCopy, typeName);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">
              {t('parser.title')}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {t('parser.description')}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
            {t('checker.premium')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isPremium ? (
          <>
            <Textarea
              placeholder="Enter tokens in format: outlook:password:token (one per line)"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full mb-4"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExtract('outlook')}
                className="h-auto p-4 flex flex-col items-center"
                disabled={!inputText.trim()}
              >
                <Mail className="w-5 h-5 mb-2 text-blue-600" />
                <div className="text-sm font-medium">{t('parser.extractOutlook')}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {parsedData.outlooks.length} found
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleExtract('token')}
                className="h-auto p-4 flex flex-col items-center"
                disabled={!inputText.trim()}
              >
                <Key className="w-5 h-5 mb-2 text-green-600" />
                <div className="text-sm font-medium">{t('parser.extractTokens')}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {parsedData.tokens.length} found
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleExtract('all')}
                className="h-auto p-4 flex flex-col items-center"
                disabled={!inputText.trim()}
              >
                <List className="w-5 h-5 mb-2 text-purple-600" />
                <div className="text-sm font-medium">{t('parser.extractAll')}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {parsedData.all.length} found
                </div>
              </Button>
            </div>
          </>
        ) : (
          <div className="relative">
            <Textarea
              placeholder="Enter tokens to parse..."
              rows={6}
              disabled
              className="w-full opacity-50 mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 opacity-50">
              <Button variant="outline" disabled className="h-auto p-4 flex flex-col items-center">
                <Mail className="w-5 h-5 mb-2" />
                <div className="text-sm">{t('parser.extractOutlook')}</div>
              </Button>
              <Button variant="outline" disabled className="h-auto p-4 flex flex-col items-center">
                <Key className="w-5 h-5 mb-2" />
                <div className="text-sm">{t('parser.extractTokens')}</div>
              </Button>
              <Button variant="outline" disabled className="h-auto p-4 flex flex-col items-center">
                <List className="w-5 h-5 mb-2" />
                <div className="text-sm">{t('parser.extractAll')}</div>
              </Button>
            </div>
            <div className="absolute inset-0 bg-gray-50 bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {t('checker.upgradeForBulk')}
                </p>
                <Button 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white"
                  onClick={() => window.location.href = '/subscribe'}
                >
                  {t('checker.upgradeNow')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
