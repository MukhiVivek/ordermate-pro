import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, MapPin, Phone, User, Calendar, Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { useOrders, Order } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const Orders = () => {
    const navigate = useNavigate();
    const { data: orders, isLoading, error } = useOrders();

    const totalSales = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
    const pendingCount = orders?.filter(o => o.status === 'pending').length || 0;
    const paidCount = orders?.filter(o => o.status === 'paid').length || 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-30">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button
                        onClick={() => navigate('/')}
                        variant="secondary"
                        size="icon"
                        className="rounded-xl"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
                        <p className="text-sm text-muted-foreground">{orders?.length || 0} total invoices</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border p-4 rounded-2xl shadow-soft"
                    >
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Sales</p>
                        <p className="text-2xl font-bold text-primary">₹{totalSales.toLocaleString()}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border p-4 rounded-2xl shadow-soft"
                    >
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Paid Orders</p>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <p className="text-2xl font-bold text-foreground">{paidCount}</p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card border border-border p-4 rounded-2xl shadow-soft"
                    >
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Pending Orders</p>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-warning" />
                            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20">
                        <p className="text-destructive">Failed to load orders</p>
                        <p className="text-muted-foreground text-sm mt-2">Please check your connection</p>
                    </div>
                )}

                {/* Orders List */}
                {!isLoading && !error && (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {orders?.map((order, idx) => (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all group overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${order.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-foreground">{order.invoice_number}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] ${order.status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}
                                                    >
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" /> {order.customerName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:text-right gap-4">
                                            <div className="flex-1">
                                                <p className="text-lg font-bold text-primary">₹{order.total.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.items.length} items</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {order.location && (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                        title="View Location"
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                    </a>
                                                )}
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Preview (if any) */}
                                    {order.notes && (
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <p className="text-xs text-muted-foreground italic truncate">
                                                " {order.notes} "
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {orders?.length === 0 && (
                            <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
                                <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground">No orders placed yet</p>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="link"
                                    className="mt-2 text-primary"
                                >
                                    Start creating invoices
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;
