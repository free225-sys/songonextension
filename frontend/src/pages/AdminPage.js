import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
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
  Search, Edit2, Trash2, Save, X, Image, FileUp, Plus,
  AlertCircle, CheckCircle, Key, FileText, Clock,
  Copy, Shield, Download, Users, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Admin Sidebar
const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('admin_dashboard') },
    { id: 'parcelles', icon: Map, label: t('admin_parcelles') },
    { id: 'access', icon: Key, label: 'Codes d\'accès' },
    { id: 'logs', icon: FileText, label: 'Journal' },
    { id: 'kmz', icon: Upload, label: t('admin_kmz') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-sidebar flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-playfair text-lg font-semibold text-white">Songon</span>
            <span className="text-green-400 text-xs block">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            data-testid={`nav-${item.id}`}
            className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          data-testid="admin-logout"
          className="admin-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav_logout')}</span>
        </button>
      </div>
    </div>
  );
};

// Dashboard Tab
const DashboardTab = ({ stats, parcelles }) => {
  const { t } = useLanguage();

  const statCards = [
    { label: 'Total Parcelles', value: stats.total, color: 'text-white' },
    { label: t('status_disponible'), value: stats.disponible, color: 'text-green-400' },
    { label: t('status_option'), value: stats.option, color: 'text-orange-400' },
    { label: t('status_vendu'), value: stats.vendu, color: 'text-red-400' },
  ];

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-white mb-2">{t('admin_dashboard')}</h2>
        <p className="text-gray-400">Vue d'ensemble de vos parcelles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-value ${stat.color}`}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card-glass p-6">
        <h3 className="font-playfair text-lg font-semibold text-white mb-4">Valeur totale du portefeuille</h3>
        <div className="text-3xl font-bold text-green-400">
          {formatPrice(stats.valeur_totale || 0)} <span className="text-lg text-gray-400">FCFA</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Surface totale: {stats.total_superficie || 0} ha
        </p>
      </div>

      <div className="card-glass p-6">
        <h3 className="font-playfair text-lg font-semibold text-white mb-4">Parcelles récentes</h3>
        <div className="space-y-3">
          {parcelles.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-white font-medium">{p.nom}</span>
                <span className="text-gray-500 text-sm ml-2">{p.type_projet}</span>
              </div>
              <Badge className={`
                ${p.statut === 'disponible' ? 'bg-green-500/20 text-green-400' : ''}
                ${p.statut === 'option' ? 'bg-orange-500/20 text-orange-400' : ''}
                ${p.statut === 'vendu' ? 'bg-red-500/20 text-red-400' : ''}
              `}>
                {p.statut}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Parcelles Tab
const ParcellesTab = ({ parcelles, onUpdate, onDelete, getAuthHeaders }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredParcelles = parcelles.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_tf.includes(search)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white mb-2">{t('admin_parcelles')}</h2>
          <p className="text-gray-400">{parcelles.length} parcelles au total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="input-dark pl-10 w-full sm:w-64"
            data-testid="search-parcelles"
          />
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Superficie</th>
                <th>Prix/m²</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParcelles.map((parcelle) => (
                <tr key={parcelle.id}>
                  <td>
                    <div>
                      <span className="font-medium text-white">{parcelle.nom}</span>
                      <span className="text-gray-500 text-xs block">Ref: {parcelle.reference_tf}</span>
                    </div>
                  </td>
                  <td>{parcelle.type_projet}</td>
                  <td>{parcelle.superficie} {parcelle.unite_superficie}</td>
                  <td>{formatPrice(parcelle.prix_m2)} FCFA</td>
                  <td>
                    <Select
                      value={parcelle.statut}
                      onValueChange={(value) => handleStatusChange(parcelle, value)}
                    >
                      <SelectTrigger className="w-32 bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1410] border-white/10">
                        <SelectItem value="disponible" className="text-green-400">
                          {t('status_disponible')}
                        </SelectItem>
                        <SelectItem value="option" className="text-orange-400">
                          {t('status_option')}
                        </SelectItem>
                        <SelectItem value="vendu" className="text-red-400">
                          {t('status_vendu')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingParcelle(parcelle)}
                        className="text-gray-400 hover:text-white"
                        data-testid={`edit-${parcelle.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(parcelle)}
                        className="text-gray-400 hover:text-red-400"
                        data-testid={`delete-${parcelle.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingParcelle && (
        <ParcelleEditDialog
          parcelle={editingParcelle}
          onClose={() => setEditingParcelle(null)}
          onSave={onUpdate}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0d1410] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t('msg_confirm_delete')}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Cette action est irréversible. La parcelle "{deleteConfirm?.nom}" sera supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t('action_cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              data-testid="confirm-delete"
            >
              {t('action_delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Parcelle Edit Dialog
const ParcelleEditDialog = ({ parcelle, onClose, onSave, getAuthHeaders }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(parcelle);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1410] border-white/10 max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white font-playfair">{t('action_edit')}: {parcelle.nom}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full bg-white/5 p-1 rounded-lg grid grid-cols-3">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="prix">Prix</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('field_nom')}</label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('field_type')}</label>
                  <Select
                    value={formData.type_projet}
                    onValueChange={(v) => handleChange('type_projet', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1410] border-white/10">
                      <SelectItem value="Golf">Golf</SelectItem>
                      <SelectItem value="Résidentiel">Résidentiel</SelectItem>
                      <SelectItem value="Mixte">Mixte</SelectItem>
                      <SelectItem value="Réserve foncière">Réserve foncière</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('field_superficie')}</label>
                  <Input
                    type="number"
                    value={formData.superficie}
                    onChange={(e) => handleChange('superficie', parseFloat(e.target.value))}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('field_configuration')}</label>
                  <Select
                    value={formData.configuration}
                    onValueChange={(v) => handleChange('configuration', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1410] border-white/10">
                      <SelectItem value="Plat">Plat</SelectItem>
                      <SelectItem value="Vallonné">Vallonné</SelectItem>
                      <SelectItem value="En pente">En pente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">{t('field_atouts')}</label>
                <Textarea
                  value={formData.atouts}
                  onChange={(e) => handleChange('atouts', e.target.value)}
                  className="input-dark"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="prix" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('field_prix_m2')} (FCFA)</label>
                  <Input
                    type="number"
                    value={formData.prix_m2}
                    onChange={(e) => handleChange('prix_m2', parseFloat(e.target.value))}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('field_valeur_globale')} (FCFA)</label>
                  <Input
                    type="number"
                    value={formData.valeur_globale}
                    onChange={(e) => handleChange('valeur_globale', parseFloat(e.target.value))}
                    className="input-dark"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Photos du site</label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.photos?.map((url, i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-lg overflow-hidden relative group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-video bg-white/5 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'photo')}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6 text-gray-500" />
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Vues drone</label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.vues_drone?.map((url, i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-video bg-white/5 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'drone')}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6 text-gray-500" />
                    )}
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('action_cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="btn-primary"
            data-testid="save-parcelle"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('action_save')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Access Codes Tab
const AccessCodesTab = ({ getAuthHeaders, parcelles }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCode, setNewCode] = useState({
    client_name: '',
    client_email: '',
    parcelle_ids: [],
    expires_hours: 72
  });

  const fetchCodes = async () => {
    try {
      const response = await axios.get(`${API}/admin/access-codes`, {
        headers: getAuthHeaders()
      });
      setCodes(response.data.access_codes || []);
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreateCode = async () => {
    if (!newCode.client_name || !newCode.client_email) {
      toast.error('Nom et email requis');
      return;
    }

    try {
      const response = await axios.post(
        `${API}/admin/access-codes`,
        newCode,
        { headers: getAuthHeaders() }
      );
      
      toast.success(
        <div>
          <p className="font-medium">Code généré avec succès</p>
          <p className="text-lg font-mono mt-1">{response.data.code}</p>
        </div>,
        { duration: 10000 }
      );
      
      setShowCreateDialog(false);
      setNewCode({ client_name: '', client_email: '', parcelle_ids: [], expires_hours: 72 });
      fetchCodes();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleRevokeCode = async (codeId) => {
    try {
      await axios.delete(`${API}/admin/access-codes/${codeId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Code révoqué');
      fetchCodes();
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
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white mb-2">Codes d'accès</h2>
          <p className="text-gray-400">Gérez les codes d'accès aux documents</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="btn-primary"
          data-testid="create-code-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-value text-white">{codes.length}</div>
          <div className="stat-label">Codes générés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-green-400">{codes.filter(c => c.active && !c.is_expired).length}</div>
          <div className="stat-label">Codes actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-red-400">{codes.filter(c => !c.active || c.is_expired).length}</div>
          <div className="stat-label">Codes expirés/révoqués</div>
        </div>
      </div>

      {/* Codes List */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Client</th>
                <th>Email</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun code d'accès
                  </td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr key={code.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">
                          {code.code}
                        </span>
                        <button 
                          onClick={() => copyCode(code.code)}
                          className="text-gray-500 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="text-white">{code.client_name}</td>
                    <td className="text-gray-400">{code.client_email}</td>
                    <td className="text-gray-400">
                      {new Date(code.expires_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      {!code.active ? (
                        <Badge className="bg-red-500/20 text-red-400">Révoqué</Badge>
                      ) : code.is_expired ? (
                        <Badge className="bg-gray-500/20 text-gray-400">Expiré</Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400">Actif</Badge>
                      )}
                    </td>
                    <td>
                      {code.active && !code.is_expired && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeCode(code.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Code Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0d1410] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white font-playfair">Générer un code d'accès</DialogTitle>
            <DialogDescription className="text-gray-400">
              Créez un code temporaire pour un client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Nom du client *</label>
              <Input
                value={newCode.client_name}
                onChange={(e) => setNewCode({ ...newCode, client_name: e.target.value })}
                className="input-dark"
                placeholder="Jean Dupont"
                data-testid="client-name-input"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Email *</label>
              <Input
                value={newCode.client_email}
                onChange={(e) => setNewCode({ ...newCode, client_email: e.target.value })}
                className="input-dark"
                placeholder="jean@exemple.com"
                data-testid="client-email-input"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Durée de validité</label>
              <Select
                value={String(newCode.expires_hours)}
                onValueChange={(v) => setNewCode({ ...newCode, expires_hours: parseInt(v) })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1410] border-white/10">
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="72">72 heures (3 jours)</SelectItem>
                  <SelectItem value="168">1 semaine</SelectItem>
                  <SelectItem value="720">1 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Accès aux parcelles</label>
              <Select
                value={newCode.parcelle_ids.length === 0 ? 'all' : 'specific'}
                onValueChange={(v) => {
                  if (v === 'all') {
                    setNewCode({ ...newCode, parcelle_ids: [] });
                  }
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1410] border-white/10">
                  <SelectItem value="all">Toutes les parcelles</SelectItem>
                  <SelectItem value="specific">Parcelles spécifiques</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateCode}
              className="btn-primary"
              data-testid="generate-code-btn"
            >
              <Key className="w-4 h-4 mr-2" />
              Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Download Logs Tab
const DownloadLogsTab = ({ getAuthHeaders }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total_downloads: 0, by_client: {}, by_parcelle: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          axios.get(`${API}/admin/download-logs`, { headers: getAuthHeaders() }),
          axios.get(`${API}/admin/download-logs/stats`, { headers: getAuthHeaders() })
        ]);
        setLogs(logsRes.data.logs || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-white mb-2">Journal des téléchargements</h2>
        <p className="text-gray-400">Traçabilité des accès aux documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-value text-white">{stats.total_downloads}</div>
          <div className="stat-label">Total téléchargements</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-green-400">{Object.keys(stats.by_client || {}).length}</div>
          <div className="stat-label">Clients uniques</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-blue-400">{Object.keys(stats.by_parcelle || {}).length}</div>
          <div className="stat-label">Parcelles consultées</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date/Heure</th>
                <th>Client</th>
                <th>Code</th>
                <th>Parcelle</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    Aucun téléchargement enregistré
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </td>
                    <td className="text-white font-medium">{log.client_name}</td>
                    <td>
                      <span className="font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-sm">
                        {log.code}
                      </span>
                    </td>
                    <td className="text-gray-400">{log.parcelle_id}</td>
                    <td className="text-gray-400">{log.document_type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Clients */}
      {Object.keys(stats.by_client || {}).length > 0 && (
        <div className="card-glass p-6">
          <h3 className="font-playfair text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Top clients
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.by_client).slice(0, 5).map(([client, data]) => (
              <div key={client} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white font-medium">{client}</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {data.count} téléchargement(s)
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// KMZ Import Tab
const KMZTab = ({ onImport, getAuthHeaders }) => {
  const { t } = useLanguage();
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
      const response = await axios.post(
        `${API}/admin/upload/kmz`,
        formData,
        { 
          headers: { 
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
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
      await axios.post(
        `${API}/admin/parcelles/import`,
        parsedParcelles,
        { headers: getAuthHeaders() }
      );
      toast.success('Parcelles importées avec succès');
      onImport();
      setParsedParcelles([]);
    } catch (error) {
      toast.error('Erreur lors de l\'import');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-white mb-2">{t('admin_kmz')}</h2>
        <p className="text-gray-400">Importez un fichier KMZ pour ajouter de nouvelles parcelles</p>
      </div>

      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        data-testid="kmz-dropzone"
      >
        <input
          type="file"
          accept=".kmz,.kml"
          onChange={handleDrop}
          className="hidden"
          id="kmz-upload"
        />
        <label htmlFor="kmz-upload" className="cursor-pointer">
          {uploading ? (
            <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          ) : (
            <FileUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
          )}
          <p className="text-white font-medium mb-2">{t('admin_upload_kmz')}</p>
          <p className="text-gray-500 text-sm">{t('admin_drag_drop')}</p>
        </label>
      </div>

      {parsedParcelles.length > 0 && (
        <motion.div 
          className="card-glass p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair text-lg font-semibold text-white">
              {parsedParcelles.length} {t('admin_detected')}
            </h3>
            <Button 
              onClick={handleImport}
              className="btn-primary"
              data-testid="import-parcelles"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('action_import')}
            </Button>
          </div>
          
          <div className="space-y-3">
            {parsedParcelles.map((p, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white">{p.nom}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  {p.coordinates?.length || 0} points
                </span>
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
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parcelles, setParcelles] = useState([]);
  const [stats, setStats] = useState({ total: 0, disponible: 0, option: 0, vendu: 0 });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050a07] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a07] flex" data-testid="admin-page">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} parcelles={parcelles} />
        )}
        {activeTab === 'parcelles' && (
          <ParcellesTab 
            parcelles={parcelles} 
            onUpdate={fetchData}
            onDelete={fetchData}
            getAuthHeaders={getAuthHeaders}
          />
        )}
        {activeTab === 'access' && (
          <AccessCodesTab 
            getAuthHeaders={getAuthHeaders}
            parcelles={parcelles}
          />
        )}
        {activeTab === 'logs' && (
          <DownloadLogsTab getAuthHeaders={getAuthHeaders} />
        )}
        {activeTab === 'kmz' && (
          <KMZTab 
            onImport={fetchData}
            getAuthHeaders={getAuthHeaders}
          />
        )}
      </main>
    </div>
  );
}
