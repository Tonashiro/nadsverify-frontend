"use client";

import { ICategory } from "@/app/api/categories/route";
import { IProject } from "@/app/api/projects/route";
import { IStats } from "@/app/api/stats/route";
import { TVoteType } from "@/app/api/votes/[projectId]/route";
import { Hero } from "@/components/Hero";
import { ProjectFilter } from "@/components/ProjectFilter";
import { Projects } from "@/components/Projects";
import { Spinner } from "@/components/Spinner";
import { StatsSection } from "@/components/StatsSection";
import { PROJECTS_AMOUNT_LIMIT } from "@/constants";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

type TProjectVote = {
  id: string;
  projectId: string;
  projectName: string;
  voteType: TVoteType;
  createdAt: Date;
};

interface IUserVotes {
  totalVotes: number;
  votes: Array<TProjectVote>;
}

interface IHomePage {
  categories: ICategory[];
  stats: IStats;
  initialProjects: IProject[];
  userVotes: IUserVotes;
}

export const HomePage: React.FC<IHomePage> = ({
  categories,
  stats,
  initialProjects,
  userVotes,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const queryKey = ["projects", selectedCategories];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: 1,
      queryFn: async ({ pageParam = 1 }) => {
        const categoryParam = selectedCategories.join(",");

        const url = new URL(`/api/projects`, window.location.origin);
        url.searchParams.set("page", pageParam.toString());
        url.searchParams.set("limit", PROJECTS_AMOUNT_LIMIT.toString());
        if (categoryParam) url.searchParams.set("category", categoryParam);

        const res = await fetch(url.toString(), { credentials: "include" });

        if (!res.ok) {
          throw new Error("Failed to fetch projects");
        }

        return res.json();
      },
      getNextPageParam: (lastPage) => {
        return lastPage.pagination.page < lastPage.pagination.pages
          ? lastPage.pagination.page + 1
          : undefined;
      },
      initialData: {
        pages: [initialProjects],
        pageParams: [1],
      },
      refetchOnWindowFocus: "always",
      refetchInterval: 60 * 1000,
      retry: 1,
    });

  const fetchNextPageCallback = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fetch stats using React Query
  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      return res.json();
    },
    initialData: stats,
    refetchOnWindowFocus: "always",
    refetchInterval: 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchNextPageCallback();
        }
      },
      { threshold: 0.25 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [fetchNextPageCallback]);

  // Map user votes to projects
  const allProjects =
    data?.pages
      .flatMap((page) => page.projects)
      .map((project) => {
        const userVote = userVotes?.votes?.find(
          (vote) => vote.projectId === project.id
        );
        return {
          ...project,
          voteType: userVote?.voteType ?? undefined,
        };
      }) ?? [];

  return (
    <div className="min-h-screen flex flex-col mx-auto w-full px-[5%] max-w-[1920px] text-text-primary">
      <Hero />

      <StatsSection stats={statsData} />

      <div className="relative flex flex-col gap-6">
        <ProjectFilter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
        />

        <div className="flex-1">
          <Projects projects={allProjects} />
          <div
            ref={loadMoreRef}
            className="min-h-20 w-fit mx-auto flex justify-center items-center"
          >
            {(isFetchingNextPage || isLoading) && <Spinner />}
          </div>
        </div>
      </div>
    </div>
  );
};
