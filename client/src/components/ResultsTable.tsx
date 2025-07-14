import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ResultsTable() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/check-history"],
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('message.copied'),
        description: "Token information copied to clipboard",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "checking":
        return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: "bg-green-100 text-green-800",
      invalid: "bg-red-100 text-red-800",
      checking: "bg-yellow-100 text-yellow-800",
    };

    const labels = {
      valid: t('results.valid'),
      invalid: t('results.invalid'),
      checking: t('results.checking'),
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'} flex items-center w-fit`}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels] || status}</span>
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "outlook":
        return "bg-blue-100 text-blue-800";
      case "token":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const maskToken = (tokenInput: string) => {
    const parts = tokenInput.split(':');
    if (parts.length === 3) {
      const [email, password, token] = parts;
      return `${email}:***:${token.substring(0, 6)}...`;
    }
    return tokenInput.substring(0, 20) + '...';
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t('results.title')}
          </CardTitle>
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            {t('results.clearAll')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('results.noResults')}
            </h3>
            <p className="text-gray-600">
              {t('results.startChecking')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('results.token')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('results.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('results.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('results.checked')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('results.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((check: any) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">
                        {maskToken(check.tokenInput)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getTypeColor(check.tokenType)} capitalize`}>
                        {check.tokenType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(check.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(check.createdAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(check.tokenInput)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {t('results.copy')}
                        </Button>
                        {check.status === "invalid" && (
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {t('results.retry')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
