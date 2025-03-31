"use client";

import Breadcrumb from "@/components/Breadcrumbs";
import DetailStory from "@/components/DetailStory";

export default function Page() {
  return (
    <section>
      {/* Breadcrumb */}
      <div className="bg-muted/50">
        <div className="container mx-auto py-2 px-4">
          <Breadcrumb items={[{ label: "Truyện" }]} />
        </div>
      </div>
      {/* Story List */}
      <DetailStory />
    </section>
  );
}
