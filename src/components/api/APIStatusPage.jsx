import React, { useState, useEffect } from 'react';
import { displayAPIStatus } from '../../services/apiStatusChecker.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

const APIStatusPage = () => {
  const [statusReport, setStatusReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const checkAPIStatus = async () => {
    setIsLoading(true);
    try {
      const report = await displayAPIStatus();
      setStatusReport(report);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to check API status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for pre-loaded status from main.jsx
    if (window.vocelioAPIStatus) {
      setStatusReport(window.vocelioAPIStatus);
      setLastUpdated(new Date());
      setIsLoading(false);
    } else {
      checkAPIStatus();
    }
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      operational: 'success',
      warning: 'warning',
      error: 'destructive',
      unknown: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Checking API Status...</span>
      </div>
    );
  }

  if (!statusReport) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load API status</p>
            <Button onClick={checkAPIStatus} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(statusReport.summary.overall)}
                API Status Dashboard
              </CardTitle>
              <CardDescription>
                Real-time status of all critical services
              </CardDescription>
            </div>
            <div className="text-right">
              <Button onClick={checkAPIStatus} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statusReport.summary.operational}
              </div>
              <p className="text-sm text-muted-foreground">Operational</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statusReport.summary.warnings}
              </div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statusReport.summary.errors}
              </div>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Production Ready:</span>
              {getStatusBadge(statusReport.summary.readyForProduction ? 'operational' : 'error')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Categories */}
      {Object.entries(statusReport.services).map(([category, services]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(services).map(([serviceName, serviceStatus]) => (
                <div key={serviceName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(serviceStatus.status)}
                    <div>
                      <h4 className="font-medium">{serviceName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {serviceStatus.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(serviceStatus.status)}
                    {serviceStatus.responseTime && (
                      <span className="text-xs text-muted-foreground">
                        {serviceStatus.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Critical Issues */}
      {statusReport.summary.errors > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Critical Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statusReport.services).map(([category, services]) =>
                Object.entries(services)
                  .filter(([_, service]) => service.status === 'error')
                  .map(([serviceName, service]) => (
                    <div key={`${category}-${serviceName}`} className="p-2 bg-white rounded border border-red-200">
                      <strong className="text-red-700">{serviceName}:</strong> {service.message}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Readiness Report */}
      <Card className={statusReport.summary.readyForProduction ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${statusReport.summary.readyForProduction ? 'text-green-700' : 'text-yellow-700'}`}>
            {statusReport.summary.readyForProduction ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Production Ready
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Production Readiness Issues
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={statusReport.summary.readyForProduction ? 'text-green-700' : 'text-yellow-700'}>
            {statusReport.summary.readyForProduction
              ? 'All critical services are operational and ready for production deployment.'
              : 'Some critical services need attention before production deployment is recommended.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIStatusPage;