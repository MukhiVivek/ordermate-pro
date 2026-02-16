import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = isSignup ? '/user/signup' : '/user/signin';
            const data = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (isSignup) {
                toast.success('Account created! Please sign in.');
                setIsSignup(false);
            } else if (data.token) {
                login({ token: data.token, username });
                toast.success('Welcome back!');
                navigate('/');
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            toast.error(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative">
                    <div className="text-center space-y-2 mb-8">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-3 bg-gradient-primary rounded-2xl mb-4 shadow-lg shadow-primary/20"
                        >
                            <Sparkles className="h-8 w-8 text-primary-foreground" />
                        </motion.div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {isSignup ? 'Join OrderMate' : 'Welcome to Magnet'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isSignup ? 'Create your salesman account' : 'Enter your credentials to access the dashboard'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-12 h-14 bg-muted/50 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 h-14 bg-muted/50 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 text-lg bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/25 rounded-xl transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignup ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-border/50">
                        <p className="text-muted-foreground text-sm">
                            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
                            >
                                {isSignup ? 'Sign in here' : 'Sign up for free'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Brand Footer */}
                <p className="mt-8 text-center text-xs text-muted-foreground uppercase tracking-[0.2em]">
                    Powered by Magnet ERP
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
