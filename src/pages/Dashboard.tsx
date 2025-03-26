
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: "Total Documents",
      value: "156",
      icon: FileText,
      description: "All time",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Documents",
      value: "23",
      icon: Clock,
      description: "Awaiting action",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Processed Documents",
      value: "132",
      icon: CheckCircle,
      description: "Completed",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Requires Attention",
      value: "5",
      icon: AlertCircle,
      description: "Urgent items",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  const recentDocuments = [
    {
      id: "DOC-2023-1265",
      title: "Regional Office Request",
      status: "Pending",
      date: "2023-07-24",
      priority: "High",
    },
    {
      id: "DOC-2023-1264",
      title: "Annual Budget Review",
      status: "Processing",
      date: "2023-07-23",
      priority: "Medium",
    },
    {
      id: "DOC-2023-1263",
      title: "Staff Meeting Minutes",
      status: "Completed",
      date: "2023-07-22",
      priority: "Low",
    },
  ];

  return (
    <div className="container mx-auto px-4 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.firstName || user.email.split("@")[0]}</h1>
        <p className="text-muted-foreground">Here's an overview of your document management system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Documents</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-sm">{doc.id}</td>
                    <td className="p-4 text-sm">{doc.title}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === "Completed" 
                          ? "bg-green-50 text-green-700" 
                          : doc.status === "Processing" 
                            ? "bg-blue-50 text-blue-700" 
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{doc.date}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        doc.priority === "High" 
                          ? "bg-red-500" 
                          : doc.priority === "Medium" 
                            ? "bg-amber-500" 
                            : "bg-green-500"
                      }`}></span>
                      {doc.priority}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/send`)}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" onClick={() => navigate("/dashboard/send")}>
            <FileText className="h-6 w-6" />
            <span>Interface d'envoi</span>
          </Button>
          <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="secondary">
            <Clock className="h-6 w-6" />
            <span>Pending Documents</span>
          </Button>
          <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="secondary">
            <CheckCircle className="h-6 w-6" />
            <span>Processed Documents</span>
          </Button>
          <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="secondary">
            <AlertCircle className="h-6 w-6" />
            <span>Requires Attention</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
