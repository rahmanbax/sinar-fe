"use client";

import React, { Suspense } from "react";
import VerifikatorProvinsiLayout from "@/components/v2/nav/VerifikatorProvinsiLayout";
import ToponymDetailLayout from "@/components/v2/layout/ToponymDetailLayout";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToponymDetail } from "@/hooks/useToponyms";

const RecommendationToponymDetailContent = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id as string;
    const transactionId = searchParams.get("transactionId") || "";

    const { token } = useAuth();

    const { data: response, isLoading } = useToponymDetail(id);

    const toponymData = response?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
                <p className="text-gray-400 animate-pulse font-medium">
                    Memuat Detail Toponim...
                </p>
            </div>
        );
    }

    if (!toponymData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] gap-4">
                <p className="text-red-400 font-medium">Data toponim tidak ditemukan.</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <ToponymDetailLayout
            mode="detail"
            initialData={toponymData}
            isVerifikator={false}
            // For the recommendation flow, we usually just see the detail 
            // without needing to approve/reject again as it's already "complete"
            onSubmitAction={() => console.log("Submit clicked")}
        />
    );
};

const RecommendationToponymDetailPage = () => {
    return (
        <VerifikatorProvinsiLayout showNav={false} tightMargin={true}>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
                        <p className="text-gray-400 animate-pulse font-medium">
                            Memuat Halaman...
                        </p>
                    </div>
                }
            >
                <RecommendationToponymDetailContent />
            </Suspense>
        </VerifikatorProvinsiLayout>
    );
};

export default RecommendationToponymDetailPage;
