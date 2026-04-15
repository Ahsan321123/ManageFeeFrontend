import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function StudentCardSkeleton({ count = 5 }) {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="student-card">
          <div className="student-card-header">
            <Skeleton width={180} height={22} borderRadius={6} />
            <Skeleton width={110} height={30} borderRadius={20} />
          </div>
          <div className="student-card-body">
            <Skeleton width={80} height={18} borderRadius={4} />
            <div className="student-card-actions">
              <Skeleton width={130} height={36} borderRadius={8} />
              <Skeleton width={140} height={36} borderRadius={8} />
              <Skeleton width={150} height={36} borderRadius={8} />
              <Skeleton width={80} height={36} borderRadius={8} />
            </div>
          </div>
        </div>
      ))}
    </SkeletonTheme>
  );
}
