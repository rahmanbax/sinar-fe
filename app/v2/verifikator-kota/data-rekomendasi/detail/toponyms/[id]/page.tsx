"use client";

import React from "react";
import VerifikatorKotaLayout from "@/components/v2/nav/VerifikatorKotaLayout";
import ToponymDetailLayout from "@/components/v2/layout/ToponymDetailLayout";
import { useParams, useRouter } from "next/navigation";

const RecommendationToponymDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // DATA DUMMY: Mocking the detail for "Candi Borobudur"
    const dummyToponymData = {
        id: id || "1",
        map_name: "Candi Borobudur",
        local_name: "Borobudur",
        specific_element: "Candi",
        generic_element: "Bangunan Budaya",
        element: {
            name: "Candi",
            code: "BN1BGN101"
        },
        province_name: "JAWA BARAT",
        regency_name: "KOTA BANDUNG",
        district_name: "KOTA BANDUNG",
        village_name: "BANDUNG TIMUR",
        status: "recommended",
        coordinates: "110.204, -7.608",
        location_point: {
            type: "Point",
            coordinates: [107.637, -6.966]
        },
        creator: {
            name: "Mamat"
        },
        created_at: "2026-04-16T11:53:56.000000Z",
        photos: [],
        review_transaction_data: [
            {
                user: "Admin 1",
                handledts: "2026-04-16 12:02:57+00"
            }
        ]
    };

    return (
        <VerifikatorKotaLayout showNav={false} tightMargin={true}>
            <div className="p-4 bg-gray-50 min-h-screen">
                <ToponymDetailLayout
                    mode="detail"
                    initialData={dummyToponymData}
                    isVerifikator={true}
                    // For the recommendation flow, we usually just see the detail 
                    // without needing to approve/reject again as it's already "complete"
                    onSubmitAction={() => console.log("Submit clicked")}
                    onApproveAction={() => alert("Data sudah dalam status rekomendasi")}
                    onRejectAction={() => alert("Data hanya untuk tampilan detail")}
                />
            </div>
        </VerifikatorKotaLayout>
    );
};

export default RecommendationToponymDetailPage;
