"use client";

import { useQuery } from "@tanstack/react-query";
import { Message } from "ai";
import axios from "axios";
import { useEffect, useState } from "react";

type Props = { pdf_url: string; file_key: string };

const PDFViewer = ({ pdf_url, file_key }: Props) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["file_key", file_key],
    queryFn: async () => {
      const response = await axios.post(
        "/api/download-pdf",
        {
          file_key,
        },
        {
          responseType: "blob",
        }
      );
      return response.data;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      setBlobUrl(() => URL.createObjectURL(data));
    }
  }, [data]);

  return (
    <>{blobUrl && <iframe src={blobUrl} className="w-full h-full"></iframe>}</>
  );
};

export default PDFViewer;
