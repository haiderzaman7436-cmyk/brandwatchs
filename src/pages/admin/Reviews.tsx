import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAudit } from "@/hooks/useAudit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Star, Search, Trash2, Eye,
  MessageCircle, ThumbsUp, Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
}

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-3 w-3 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))}
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { addLog } = useAudit();
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[];
      setReviews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, userName: string) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      addLog("Review Deleted", `Deleted review by ${userName}`);
      toast({ title: "Review deleted!" });
      setDeleteConfirmId(null);
      if (selectedReview?.id === id) setSelectedReview(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
    }
  };

  const filtered = reviews.filter((r) =>
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";
  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const lowRatings = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
          Reviews Management
        </h1>
        <p className="text-muted-foreground mt-1">Monitor and manage customer reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length, icon: MessageCircle, color: "text-brand-accent" },
          { label: "Avg Rating", value: avgRating, icon: Star, color: "text-yellow-500" },
          { label: "5 Star Reviews", value: fiveStars, icon: ThumbsUp, color: "text-green-600" },
          { label: "Low Ratings (≤2)", value: lowRatings, icon: Star, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
            <Input
              placeholder="Search by customer name, email or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Helpful</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading reviews...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white text-xs font-bold">
                          {(review.userName || "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">{review.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StarDisplay rating={review.rating} />
                        <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-xs">{review.comment}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <ThumbsUp className="h-3 w-3 text-brand-accent" />
                        {review.helpful || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReview(review)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteConfirmId(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-brand-accent" />
              Review Details
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-brand-background rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-bold">
                  {(selectedReview.userName || "C")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{selectedReview.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.userEmail}</p>
                  <StarDisplay rating={selectedReview.rating} />
                </div>
              </div>
              <div className="p-3 bg-brand-background rounded-xl">
                <p className="text-sm leading-relaxed">{selectedReview.comment}</p>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> {selectedReview.helpful || 0} found helpful
                </span>
                <span>{new Date(selectedReview.createdAt).toLocaleString()}</span>
              </div>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={() => setDeleteConfirmId(selectedReview.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Review
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Review
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-brand-secondary">Are you sure you want to delete this review? This cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                const r = reviews.find((r) => r.id === deleteConfirmId);
                if (r) handleDelete(r.id, r.userName);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reviews;