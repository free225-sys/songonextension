import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  MapPin, LayoutDashboard, Map, Upload, LogOut,
  Search, Edit2, Trash2, Save, X, Plus, Home,
  Key, FileText, Clock, Copy, Download, Users, 
  Eye, EyeOff, FileSpreadsheet, File, TrendingUp,
  CheckCircle, AlertCircle, Calendar, DollarSign,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Modern Stat Card Component
const ModernStatCard = ({ icon: Icon, label, value, trend, trendValue, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-6 group hover:border-green-500/30 transition-all duration-300"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
    
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <p className="font-montserrat text-gray-400 text-sm mb-1">{label}</p>
      <p className="font-playfair text-3xl font-bold text-white">{value}</p>
      
      {trend && (
        <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
      )}
    </div>
  </motion.div>
);

// Admin Sidebar - Modern Design
const AdminSidebar = ({ activeTab, setActiveTab, notificationCount = 0 }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'parcelles', icon: Map, label: 'Parcelles' },
    { id: 'access', icon: Key, label: 'Codes d\'accès' },
    { id: 'logs', icon: FileText, label: 'Journal', badge: notificationCount },
    { id: 'kmz', icon: Upload, label: 'Import KMZ' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`bg-gradient-to-b from-[#0a0f0c] to-[#050807] border-r border-white/5 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <MapPin className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <span className="font-playfair text-lg font-bold text-white">Songon</span>
              <span className="text-green-400 text-xs font-montserrat block">Admin Panel</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveTab(item.id)}
            data-testid={`nav-${item.id}`}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat text-sm font-medium transition-all duration-200 relative ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-green-500/20 to-green-500/5 text-green-400 border border-green-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span>{item.label}</span>}
            {/* Notification Badge */}
            {item.badge > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-montserrat text-sm"
        >
          <Home className="w-5 h-5" />
          {!collapsed && <span>Retour au site</span>}
        </Link>
        <button
          onClick={handleLogout}
          data-testid="admin-logout"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-montserrat text-sm"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </motion.div>
  );
};

// Dashboard Tab - Modern Design
const DashboardTab = ({ stats, parcelles }) => {
  const { t } = useLanguage();
  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-playfair text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="font-montserrat text-gray-400">Vue d'ensemble de votre portefeuille foncier</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          icon={Map}
          label="Total Parcelles"
          value={stats.total}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <ModernStatCard
          icon={CheckCircle}
          label="Disponibles"
          value={stats.disponible}
          trend="up"
          trendValue={`${Math.round((stats.disponible / stats.total) * 100)}%`}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay={0.1}
        />
        <ModernStatCard
          icon={Clock}
          label="Sous option"
          value={stats.option}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          delay={0.2}
        />
        <ModernStatCard
          icon={DollarSign}
          label="Vendues"
          value={stats.vendu}
          color="bg-gradient-to-br from-rose-500 to-rose-600"
          delay={0.3}
        />
      </div>

      {/* Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/20 p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-montserrat text-green-400/80 text-sm">Valeur totale du portefeuille</p>
              <p className="font-playfair text-4xl font-bold text-white">
                {formatPrice(stats.valeur_totale || 0)} <span className="text-lg text-gray-400">FCFA</span>
              </p>
            </div>
          </div>
          <p className="font-montserrat text-gray-400 text-sm">
            Surface totale: <span className="text-white font-medium">{stats.total_superficie || 0} hectares</span>
          </p>
        </div>
      </motion.div>

      {/* Recent Parcelles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="font-playfair text-xl font-bold text-white">Parcelles récentes</h3>
        </div>
        <div className="divide-y divide-white/5">
          {parcelles.slice(0, 5).map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  p.statut === 'disponible' ? 'bg-green-500/20' :
                  p.statut === 'option' ? 'bg-orange-500/20' : 'bg-red-500/20'
                }`}>
                  <Map className={`w-5 h-5 ${
                    p.statut === 'disponible' ? 'text-green-400' :
                    p.statut === 'option' ? 'text-orange-400' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <p className="font-montserrat text-white font-medium">{p.nom}</p>
                  <p className="font-montserrat text-gray-500 text-sm">{p.type_projet} • {p.superficie} {p.unite_superficie}</p>
                </div>
              </div>
              <Badge className={`font-montserrat ${
                p.statut === 'disponible' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                p.statut === 'option' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              } border`}>
                {p.statut}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Parcelles Tab with Export functionality
const ParcellesTab = ({ parcelles, onUpdate, onDelete, getAuthHeaders }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredParcelles = parcelles.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_tf?.includes(search)
  );

  const handleStatusChange = async (parcelle, newStatus) => {
    try {
      await axios.patch(
        `${API}/admin/parcelles/${parcelle.id}/status`,
        { statut: newStatus },
        { headers: getAuthHeaders() }
      );
      onUpdate();
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(
        `${API}/admin/parcelles/${deleteConfirm.id}`,
        { headers: getAuthHeaders() }
      );
      onUpdate();
      toast.success('Parcelle supprimée');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Songon Extension', 14, 25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport des Parcelles', 14, 33);
    
    // Date
    doc.setTextColor(200, 200, 200);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 140, 25);
    
    // Table
    doc.autoTable({
      startY: 50,
      head: [['Nom', 'Type', 'Superficie', 'Prix/m²', 'Valeur', 'Statut']],
      body: filteredParcelles.map(p => [
        p.nom,
        p.type_projet,
        `${p.superficie} ${p.unite_superficie}`,
        `${formatPrice(p.prix_m2)} FCFA`,
        `${formatPrice(p.valeur_globale)} FCFA`,
        p.statut.toUpperCase()
      ]),
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        5: {
          cellWidth: 25,
          halign: 'center'
        }
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount} | Songon Extension - songonextension.com`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save('songon-parcelles-rapport.pdf');
    toast.success('Rapport PDF exporté');
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredParcelles.map(p => ({
      'Nom': p.nom,
      'Référence TF': p.reference_tf,
      'Type de projet': p.type_projet,
      'Superficie': p.superficie,
      'Unité': p.unite_superficie,
      'Prix/m² (FCFA)': p.prix_m2,
      'Valeur globale (FCFA)': p.valeur_globale,
      'Configuration': p.configuration,
      'Statut': p.statut,
      'Atouts': p.atouts
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parcelles');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 8 }, { wch: 15 }, { wch: 18 }, { wch: 12 },
      { wch: 12 }, { wch: 40 }
    ];
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'songon-parcelles-export.xlsx');
    toast.success('Export Excel généré');
  };

  return (
    <div className="space-y-6">
      {/* Header with Export buttons */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">Gestion des Parcelles</h1>
          <p className="font-montserrat text-gray-400">{parcelles.length} parcelles au total</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              data-testid="search-parcelles"
            />
          </div>
          
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            data-testid="export-pdf-btn"
          >
            <File className="w-4 h-4 mr-2" />
            PDF
          </Button>
          
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            data-testid="export-excel-btn"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Nom</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Type</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Superficie</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Prix/m²</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Statut</th>
                <th className="text-right p-4 font-montserrat text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredParcelles.map((parcelle, index) => (
                <motion.tr
                  key={parcelle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-montserrat text-white font-medium">{parcelle.nom}</p>
                      <p className="font-montserrat text-gray-500 text-xs">Ref: {parcelle.reference_tf}</p>
                    </div>
                  </td>
                  <td className="p-4 font-montserrat text-gray-300">{parcelle.type_projet}</td>
                  <td className="p-4 font-montserrat text-gray-300">{parcelle.superficie} {parcelle.unite_superficie}</td>
                  <td className="p-4 font-montserrat text-gray-300">{formatPrice(parcelle.prix_m2)} FCFA</td>
                  <td className="p-4">
                    <Select
                      value={parcelle.statut || 'disponible'}
                      onValueChange={(value) => handleStatusChange(parcelle, value)}
                    >
                      <SelectTrigger 
                        className={`w-32 border-0 ${
                          parcelle.statut === 'disponible' ? 'bg-green-500/20 text-green-400' :
                          parcelle.statut === 'option' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}
                        data-testid={`status-${parcelle.id}`}
                      >
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1410] border-white/10">
                        <SelectItem value="disponible" className="text-green-400">Disponible</SelectItem>
                        <SelectItem value="option" className="text-orange-400">Sous option</SelectItem>
                        <SelectItem value="vendu" className="text-red-400">Vendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingParcelle(parcelle)}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                        data-testid={`edit-${parcelle.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(parcelle)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        data-testid={`delete-${parcelle.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      {editingParcelle && (
        <ParcelleEditDialog
          parcelle={editingParcelle}
          onClose={() => setEditingParcelle(null)}
          onSave={onUpdate}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0d1410] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white font-playfair">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-gray-400 font-montserrat">
              Cette action est irréversible. La parcelle "{deleteConfirm?.nom}" sera supprimée définitivement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              data-testid="confirm-delete"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Parcelle Edit Dialog
const ParcelleEditDialog = ({ parcelle, onClose, onSave, getAuthHeaders }) => {
  const [formData, setFormData] = useState({
    ...parcelle,
    type_projet: parcelle.type_projet || 'Résidentiel',
    configuration: parcelle.configuration || 'Plat',
    superficie: parcelle.superficie || 0,
    prix_m2: parcelle.prix_m2 || 0,
    valeur_globale: parcelle.valeur_globale || 0,
    atouts: parcelle.atouts || '',
    photos: parcelle.photos || [],
    vues_drone: parcelle.vues_drone || []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [officialDocs, setOfficialDocs] = useState(parcelle.official_documents || {});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API}/admin/parcelles/${parcelle.id}`,
        formData,
        { headers: getAuthHeaders() }
      );
      toast.success('Parcelle mise à jour');
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('image_type', type);

    setUploadingImage(true);
    try {
      const response = await axios.post(
        `${API}/admin/upload/image/${parcelle.id}`,
        formDataUpload,
        { 
          headers: { 
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const newUrl = response.data.url;
      if (type === 'photo') {
        setFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), newUrl]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          vues_drone: [...(prev.vues_drone || []), newUrl]
        }));
      }
      toast.success('Image ajoutée');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
    setUploadingImage(false);
  };

  // Handle official document upload
  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.pdf')) {
      toast.error('Seuls les fichiers PDF sont autorisés');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('document_type', docType);

    setUploadingDoc(true);
    try {
      const response = await axios.post(
        `${API}/admin/upload/document/${parcelle.id}`,
        formDataUpload,
        { 
          headers: { 
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update local state
      setOfficialDocs(prev => ({
        ...prev,
        [docType]: {
          type: docType,
          filename: response.data.filename,
          original_name: file.name,
          uploaded_at: new Date().toISOString()
        }
      }));
      
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'upload');
    }
    setUploadingDoc(false);
  };

  // Handle document deletion - supports deleting specific file by ID
  const handleDeleteDocument = async (docType, docId = null) => {
    try {
      const params = docId ? `?document_id=${docId}` : '';
      await axios.delete(
        `${API}/admin/document/${parcelle.id}/${docType}${params}`,
        { headers: getAuthHeaders() }
      );
      
      if (docId) {
        // Remove specific document from list
        setOfficialDocs(prev => {
          const updated = { ...prev };
          if (Array.isArray(updated[docType])) {
            updated[docType] = updated[docType].filter(d => d.id !== docId);
            if (updated[docType].length === 0) {
              delete updated[docType];
            }
          } else {
            delete updated[docType];
          }
          return updated;
        });
      } else {
        // Remove all documents of this type
        setOfficialDocs(prev => {
          const updated = { ...prev };
          delete updated[docType];
          return updated;
        });
      }
      
      toast.success('Document supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const documentTypes = [
    { key: 'acd', label: 'Arrêté de Concession Définitive (ACD)', icon: FileText },
    { key: 'plan', label: 'Plan cadastral / Bornage', icon: Map },
    { key: 'extrait_cadastral', label: 'Extrait cadastral', icon: FileText },
    { key: 'titre_foncier', label: 'Titre foncier', icon: FileText },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1410] border-white/10 max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white font-playfair text-xl">Modifier: {parcelle.nom}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full bg-white/5 p-1 rounded-xl grid grid-cols-4">
              <TabsTrigger value="info" className="rounded-lg text-xs">Infos</TabsTrigger>
              <TabsTrigger value="prix" className="rounded-lg text-xs">Prix</TabsTrigger>
              <TabsTrigger value="images" className="rounded-lg text-xs">Images</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg text-xs">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-montserrat">Nom</label>
                  <Input
                    value={formData.nom || ''}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="edit-nom"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-montserrat">Type de parcelle</label>
                  <Select 
                    value={formData.type_projet || ''} 
                    onValueChange={(v) => handleChange('type_projet', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="edit-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1410] border-white/10">
                      <SelectItem value="Golf">Golf</SelectItem>
                      <SelectItem value="Résidentiel">Résidentiel</SelectItem>
                      <SelectItem value="Mixte">Mixte</SelectItem>
                      <SelectItem value="Réserve foncière">Réserve foncière</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-montserrat">Superficie (ha)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.superficie || ''}
                    onChange={(e) => handleChange('superficie', parseFloat(e.target.value) || 0)}
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="edit-superficie"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-montserrat">Configuration</label>
                  <Select 
                    value={formData.configuration || ''} 
                    onValueChange={(v) => handleChange('configuration', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="edit-config">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1410] border-white/10">
                      <SelectItem value="Plat">Plat</SelectItem>
                      <SelectItem value="Vallonné">Vallonné</SelectItem>
                      <SelectItem value="En pente">En pente</SelectItem>
                      <SelectItem value="Mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block font-montserrat">Atouts</label>
                <Textarea
                  value={formData.atouts || ''}
                  onChange={(e) => handleChange('atouts', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                  data-testid="edit-atouts"
                />
              </div>
            </TabsContent>

            <TabsContent value="prix" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-montserrat">Prix/m² (FCFA)</label>
                  <Input
                    type="number"
                    step="100"
                    value={formData.prix_m2 || ''}
                    onChange={(e) => handleChange('prix_m2', parseFloat(e.target.value) || 0)}
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="edit-prix-m2"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-montserrat">Valeur globale (FCFA)</label>
                  <Input
                    type="number"
                    step="1000"
                    value={formData.valeur_globale || ''}
                    onChange={(e) => handleChange('valeur_globale', parseFloat(e.target.value) || 0)}
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="edit-valeur-globale"
                  />
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Les prix sont en FCFA. La valeur globale devrait correspondre à (superficie × 10000 × prix/m²).
                </p>
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block font-montserrat">Photos du site</label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.photos?.map((url, i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-video bg-white/5 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'photo')} disabled={uploadingImage} />
                    {uploadingImage ? <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <Plus className="w-6 h-6 text-gray-500" />}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block font-montserrat">Vues drone</label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.vues_drone?.map((url, i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-video bg-white/5 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'drone')} disabled={uploadingImage} />
                    {uploadingImage ? <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <Plus className="w-6 h-6 text-gray-500" />}
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* Documents Officiels Tab */}
            <TabsContent value="documents" className="mt-4 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                <p className="text-amber-400 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Uploadez les documents officiels (PDF uniquement). Vous pouvez ajouter plusieurs fichiers par type. Un filigrane sera automatiquement ajouté lors de la consultation.</span>
                </p>
              </div>

              <div className="space-y-4">
                {documentTypes.map((docType) => {
                  const uploadedDocs = officialDocs[docType.key];
                  // Handle both single doc (dict) and multiple docs (list)
                  const docList = Array.isArray(uploadedDocs) ? uploadedDocs : (uploadedDocs ? [uploadedDocs] : []);
                  const hasDoc = docList.length > 0;
                  
                  return (
                    <div 
                      key={docType.key} 
                      className={`p-4 rounded-xl border transition-colors ${
                        hasDoc 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            hasDoc ? 'bg-green-500/20' : 'bg-white/10'
                          }`}>
                            <docType.icon className={`w-5 h-5 ${hasDoc ? 'text-green-400' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{docType.label}</p>
                            <p className={`text-xs ${hasDoc ? 'text-green-400' : 'text-gray-500'}`}>
                              {hasDoc ? `${docList.length} fichier(s) uploadé(s)` : 'Aucun document uploadé'}
                            </p>
                          </div>
                        </div>
                        
                        <label className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          'bg-green-500 text-black hover:bg-green-400'
                        }`}>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            className="hidden" 
                            onChange={(e) => handleDocumentUpload(e, docType.key)} 
                            disabled={uploadingDoc}
                          />
                          {uploadingDoc ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <Plus className="w-4 h-4" />
                              Ajouter
                            </span>
                          )}
                        </label>
                      </div>
                      
                      {/* List of uploaded files */}
                      {docList.length > 0 && (
                        <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
                          {docList.map((doc, idx) => (
                            <div key={doc.id || idx} className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-400" />
                                <span className="text-gray-300 text-sm truncate max-w-[200px]">
                                  {doc.original_name || doc.filename}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteDocument(docType.key, doc.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-green-500 to-green-600 text-black hover:from-green-600 hover:to-green-700" data-testid="save-parcelle">
            {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Enregistrer</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Access Codes Tab with Profile Types
const AccessCodesTab = ({ getAuthHeaders, parcelles }) => {
  const [codes, setCodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCodeDetails, setSelectedCodeDetails] = useState(null);
  const [newCode, setNewCode] = useState({ 
    client_name: '', 
    client_email: '', 
    parcelle_ids: [], 
    expires_hours: 72,
    profile_type: 'PROSPECT',
    video_url: '',
    camera_enabled: false
  });

  const fetchData = async () => {
    try {
      const [codesRes, logsRes] = await Promise.all([
        axios.get(`${API}/admin/access-codes`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/download-logs`, { headers: getAuthHeaders() })
      ]);
      setCodes(codesRes.data.access_codes || []);
      setLogs(logsRes.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Get documents consulted by a specific code
  const getCodeUsage = (code) => {
    const codeLogs = logs.filter(l => l.code === code);
    return {
      count: codeLogs.length,
      documents: [...new Set(codeLogs.map(l => l.document_type))],
      lastAccess: codeLogs.length > 0 ? codeLogs[codeLogs.length - 1].timestamp : null
    };
  };

  const handleCreateCode = async () => {
    if (!newCode.client_name || !newCode.client_email) {
      toast.error('Nom et email requis');
      return;
    }
    try {
      const response = await axios.post(`${API}/admin/access-codes`, newCode, { headers: getAuthHeaders() });
      toast.success(
        <div>
          <p className="font-medium">Code {newCode.profile_type} généré</p>
          <p className="text-lg font-mono mt-1">{response.data.code}</p>
        </div>, 
        { duration: 10000 }
      );
      setShowCreateDialog(false);
      setNewCode({ 
        client_name: '', 
        client_email: '', 
        parcelle_ids: [], 
        expires_hours: 72,
        profile_type: 'PROSPECT',
        video_url: '',
        camera_enabled: false
      });
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleRevokeCode = async (codeId) => {
    try {
      await axios.delete(`${API}/admin/access-codes/${codeId}`, { headers: getAuthHeaders() });
      toast.success('Code révoqué');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la révocation');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">Codes d'accès</h1>
          <p className="font-montserrat text-gray-400">Gérez les profils PROSPECT et PROPRIÉTAIRE</p>
        </motion.div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-green-500 to-green-600 text-black hover:from-green-600 hover:to-green-700" data-testid="create-code-btn">
          <Plus className="w-4 h-4 mr-2" />Nouveau code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <ModernStatCard icon={Key} label="Total codes" value={codes.length} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <ModernStatCard icon={Users} label="Prospects" value={codes.filter(c => c.profile_type === 'PROSPECT' && c.active).length} color="bg-gradient-to-br from-amber-500 to-amber-600" />
        <ModernStatCard icon={CheckCircle} label="Propriétaires" value={codes.filter(c => c.profile_type === 'PROPRIETAIRE' && c.active).length} color="bg-gradient-to-br from-green-500 to-green-600" />
        <ModernStatCard icon={Download} label="Documents consultés" value={logs.length} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <ModernStatCard icon={AlertCircle} label="Expirés/Révoqués" value={codes.filter(c => !c.active || c.is_expired).length} color="bg-gradient-to-br from-red-500 to-red-600" />
      </div>

      {/* Codes Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Code</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Profil</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Client</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Caméra</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Docs consultés</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Expiration</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Statut</th>
                <th className="text-right p-4 font-montserrat text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Aucun code d'accès</td></tr>
              ) : (
                codes.map((code) => {
                  const usage = getCodeUsage(code.code);
                  const profileType = code.profile_type || 'PROSPECT';
                  return (
                    <tr key={code.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">{code.code}</span>
                          <button onClick={() => copyCode(code.code)} className="text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${
                          profileType === 'PROPRIETAIRE' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {profileType === 'PROPRIETAIRE' ? '👑 Propriétaire' : '👤 Prospect'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-montserrat text-white font-medium">{code.client_name}</div>
                        <div className="font-montserrat text-gray-500 text-xs">{code.client_email}</div>
                      </td>
                      <td className="p-4">
                        {profileType === 'PROPRIETAIRE' ? (
                          code.camera_enabled ? (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                              <Eye className="w-3 h-3 mr-1" /> Activé
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-500 border border-gray-500/30">
                              <EyeOff className="w-3 h-3 mr-1" /> Désactivé
                            </Badge>
                          )
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {usage.count > 0 ? (
                          <button 
                            onClick={() => setSelectedCodeDetails({ code: code.code, client: code.client_name, logs: logs.filter(l => l.code === code.code) })}
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-medium">{usage.count} accès</span>
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">Aucun</span>
                        )}
                      </td>
                      <td className="p-4 font-montserrat text-gray-400 text-sm">
                        {profileType === 'PROPRIETAIRE' ? (
                          <span className="text-amber-400 text-xs">∞ Permanent</span>
                        ) : (
                          new Date(code.expires_at).toLocaleDateString('fr-FR')
                        )}
                      </td>
                      <td className="p-4">
                        {!code.active ? (
                          <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Révoqué</Badge>
                        ) : code.is_expired ? (
                          <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/30">Expiré</Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">Actif</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {code.active && !code.is_expired && (
                          <Button size="sm" variant="ghost" onClick={() => handleRevokeCode(code.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <EyeOff className="w-4 h-4" />
                          </Button>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Code Usage Details Dialog */}
      <Dialog open={!!selectedCodeDetails} onOpenChange={() => setSelectedCodeDetails(null)}>
        <DialogContent className="bg-[#0d1410] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-playfair flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              Documents consultés
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-montserrat">
              Client: <span className="text-white">{selectedCodeDetails?.client}</span> • Code: <span className="text-green-400 font-mono">{selectedCodeDetails?.code}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-64 overflow-y-auto space-y-2 py-4">
            {selectedCodeDetails?.logs?.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{log.document_type?.toUpperCase()}</p>
                    <p className="text-gray-500 text-xs">Parcelle: {log.parcelle_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleDateString('fr-FR')}</p>
                  <p className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0d1410] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white font-playfair">Générer un code d'accès</DialogTitle>
            <DialogDescription className="text-gray-400 font-montserrat">Créez un code temporaire pour un client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block font-montserrat">Nom du client *</label>
              <Input value={newCode.client_name} onChange={(e) => setNewCode({ ...newCode, client_name: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="Jean Dupont" data-testid="client-name-input" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block font-montserrat">Email *</label>
              <Input value={newCode.client_email} onChange={(e) => setNewCode({ ...newCode, client_email: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="jean@exemple.com" data-testid="client-email-input" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block font-montserrat">Durée de validité</label>
              <Select value={String(newCode.expires_hours)} onValueChange={(v) => setNewCode({ ...newCode, expires_hours: parseInt(v) })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="duration-select">
                  <SelectValue placeholder="Sélectionner la durée" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1410] border-white/10">
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="72">72 heures (3 jours)</SelectItem>
                  <SelectItem value="168">1 semaine</SelectItem>
                  <SelectItem value="720">1 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateCode} className="bg-gradient-to-r from-green-500 to-green-600 text-black" data-testid="generate-code-btn"><Key className="w-4 h-4 mr-2" />Générer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Download Logs Tab - Enhanced with Real-time Journal
const DownloadLogsTab = ({ getAuthHeaders, onNotificationRead }) => {
  const [logs, setLogs] = useState([]);
  const [realtimeLogs, setRealtimeLogs] = useState([]);
  const [stats, setStats] = useState({ total_downloads: 0, by_client: {}, by_parcelle: {} });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, statsRes, realtimeRes] = await Promise.all([
        axios.get(`${API}/admin/download-logs`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/download-logs/stats`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/access-logs/realtime?limit=20`, { headers: getAuthHeaders() })
      ]);
      setLogs(logsRes.data.logs || []);
      setStats(statsRes.data);
      setRealtimeLogs(realtimeRes.data.logs || []);
      // Clear notification count when viewing logs
      if (onNotificationRead) onNotificationRead();
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
    setLoading(false);
  }, [getAuthHeaders, onNotificationRead]);

  useEffect(() => { 
    fetchData();
    // Poll for new logs every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="font-playfair text-3xl font-bold text-white mb-2 flex items-center gap-3">
          Journal d'accès
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </h1>
        <p className="font-montserrat text-gray-400">Traçabilité en temps réel des accès aux documents</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ModernStatCard icon={Download} label="Total téléchargements" value={stats.total_downloads} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <ModernStatCard icon={Users} label="Clients uniques" value={Object.keys(stats.by_client || {}).length} color="bg-gradient-to-br from-green-500 to-green-600" />
        <ModernStatCard icon={Map} label="Parcelles consultées" value={Object.keys(stats.by_parcelle || {}).length} color="bg-gradient-to-br from-purple-500 to-purple-600" />
      </div>

      {/* Real-time Activity Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold text-white">Activité récente</h3>
              <p className="text-gray-500 text-xs font-montserrat">Derniers accès aux documents</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchData}
            className="text-gray-400 hover:text-white"
          >
            <Clock className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
        
        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Chargement...
            </div>
          ) : realtimeLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Aucun accès enregistré pour le moment
            </div>
          ) : (
            realtimeLogs.map((log, index) => (
              <motion.div
                key={log.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
              >
                {/* Activity indicator */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  log.document_type?.includes('email') ? 'bg-blue-500/20' : 
                  log.document_type?.includes('whatsapp') ? 'bg-green-600/20' : 'bg-purple-500/20'
                }`}>
                  {log.document_type?.includes('email') ? (
                    <FileText className="w-5 h-5 text-blue-400" />
                  ) : log.document_type?.includes('whatsapp') ? (
                    <FileText className="w-5 h-5 text-green-400" />
                  ) : (
                    <Download className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                
                {/* Log details */}
                <div className="flex-1">
                  <p className="text-white font-medium font-montserrat">
                    <span className="text-green-400">{log.client_name}</span>
                    {' '}a consulté{' '}
                    <span className="text-purple-400">{log.document_type?.replace('_sent_via_email', ' (envoi email)').replace('_sent_via_whatsapp', ' (envoi WhatsApp)').toUpperCase()}</span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Parcelle: <span className="text-gray-400">{log.parcelle_nom || log.parcelle_id}</span>
                  </p>
                </div>
                
                {/* Time */}
                <div className="text-right">
                  <p className="text-green-400 text-sm font-medium">{log.relative_time || 'Récent'}</p>
                  <p className="text-gray-600 text-xs">Code: {log.code}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Full Logs Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-playfair text-lg font-bold text-white">Historique complet</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Date/Heure</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Client</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Code</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Parcelle</th>
                <th className="text-left p-4 font-montserrat text-gray-400 text-sm font-medium">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />Aucun téléchargement enregistré</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-montserrat text-gray-400"><div className="flex items-center gap-2"><Clock className="w-4 h-4" />{new Date(log.timestamp).toLocaleString('fr-FR')}</div></td>
                    <td className="p-4 font-montserrat text-white font-medium">{log.client_name}</td>
                    <td className="p-4"><span className="font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-sm">{log.code}</span></td>
                    <td className="p-4 font-montserrat text-gray-400">{log.parcelle_id}</td>
                    <td className="p-4 font-montserrat text-gray-400">{log.document_type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top Clients */}
      {Object.keys(stats.by_client || {}).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6">
          <h3 className="font-playfair text-xl font-bold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-green-400" />Top clients</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_client).slice(0, 5).map(([client, data]) => (
              <div key={client} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="font-montserrat text-white font-medium">{client}</span>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">{data.count} téléchargement(s)</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// KMZ Import Tab
const KMZTab = ({ onImport, getAuthHeaders }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedParcelles, setParsedParcelles] = useState([]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files[0] || e.target?.files[0];
    if (!file) return;
    if (!file.name.endsWith('.kmz') && !file.name.endsWith('.kml')) {
      toast.error('Fichier KMZ ou KML requis');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API}/admin/upload/kmz`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
      setParsedParcelles(response.data.parcelles);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors du traitement');
    }
    setUploading(false);
  }, [getAuthHeaders]);

  const handleImport = async () => {
    if (parsedParcelles.length === 0) return;
    try {
      await axios.post(`${API}/admin/parcelles/import`, parsedParcelles, { headers: getAuthHeaders() });
      toast.success('Parcelles importées avec succès');
      onImport();
      setParsedParcelles([]);
    } catch (error) {
      toast.error('Erreur lors de l\'import');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="font-playfair text-3xl font-bold text-white mb-2">Import KMZ</h1>
        <p className="font-montserrat text-gray-400">Importez un fichier KMZ pour ajouter de nouvelles parcelles</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${dragOver ? 'border-green-500 bg-green-500/10' : 'border-white/20 bg-white/5'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        data-testid="kmz-dropzone"
      >
        <input type="file" accept=".kmz,.kml" onChange={handleDrop} className="hidden" id="kmz-upload" />
        <label htmlFor="kmz-upload" className="cursor-pointer">
          {uploading ? (
            <div className="w-16 h-16 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-green-400" />
            </div>
          )}
          <p className="font-montserrat text-white font-medium text-lg mb-2">Glissez votre fichier KMZ ici</p>
          <p className="font-montserrat text-gray-500 text-sm">ou cliquez pour sélectionner un fichier</p>
        </label>
      </motion.div>

      {parsedParcelles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair text-xl font-bold text-white">{parsedParcelles.length} parcelles détectées</h3>
            <Button onClick={handleImport} className="bg-gradient-to-r from-green-500 to-green-600 text-black" data-testid="import-parcelles"><Plus className="w-4 h-4 mr-2" />Importer</Button>
          </div>
          <div className="space-y-3">
            {parsedParcelles.map((p, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-green-400" /><span className="font-montserrat text-white">{p.nom}</span></div>
                <span className="font-montserrat text-gray-500 text-sm">{p.coordinates?.length || 0} points</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Main Admin Page
export default function AdminPage() {
  const { isAuthenticated, loading: authLoading, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parcelles, setParcelles] = useState([]);
  const [stats, setStats] = useState({ total: 0, disponible: 0, option: 0, vendu: 0 });
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchData = useCallback(async () => {
    try {
      const [parcellesRes, statsRes] = await Promise.all([
        axios.get(`${API}/parcelles`),
        axios.get(`${API}/stats`)
      ]);
      setParcelles(parcellesRes.data.parcelles || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const params = lastCheckTime ? `?since=${lastCheckTime}` : '';
      const response = await axios.get(`${API}/admin/notifications${params}`, { headers: getAuthHeaders() });
      if (response.data.new_count > 0 && activeTab !== 'logs') {
        setNotificationCount(response.data.new_count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated, getAuthHeaders, lastCheckTime, activeTab]);

  // Clear notifications when viewing logs
  const handleNotificationRead = useCallback(() => {
    setNotificationCount(0);
    setLastCheckTime(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchNotifications();
      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchData, fetchNotifications]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050a07] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050a07] via-[#071210] to-[#050a07] flex" data-testid="admin-page">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} notificationCount={notificationCount} />
      
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" stats={stats} parcelles={parcelles} />}
          {activeTab === 'parcelles' && <ParcellesTab key="parcelles" parcelles={parcelles} onUpdate={fetchData} onDelete={fetchData} getAuthHeaders={getAuthHeaders} />}
          {activeTab === 'access' && <AccessCodesTab key="access" getAuthHeaders={getAuthHeaders} parcelles={parcelles} />}
          {activeTab === 'logs' && <DownloadLogsTab key="logs" getAuthHeaders={getAuthHeaders} onNotificationRead={handleNotificationRead} />}
          {activeTab === 'kmz' && <KMZTab key="kmz" onImport={fetchData} getAuthHeaders={getAuthHeaders} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
