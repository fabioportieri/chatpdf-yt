"use client";

import { uploadToMinioServer } from "@/lib/minio-upload";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Inbox, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate: mutateCreateChat, isLoading: isLoadingCreateChat } =
    useMutation({
      mutationFn: async ({
        file_key,
        file_name,
      }: {
        file_key: string;
        file_name: string;
      }) => {
        const response = await axios.post("/api/create-chat", {
          file_key,
          file_name,
        });
        return response.data;
      },
    });

  const { mutate: mutateUploadPdf, isLoading: isLoadingUploadPdf } =
    useMutation({
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post("/api/upload-pdf", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      });
        return response.data;
      },
    });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);

        mutateUploadPdf(file, {
          onSuccess: ({data}) => {
            console.log("meow", data);
            // questa IF mi va uscire??
            if (!data?.file_key || !data?.file_name) {
              toast.error("Something went wrong");
              return;
            }
            mutateCreateChat(
              { file_key: data?.file_key, file_name: data?.file_name },
              {
                onSuccess: ({ chat_id }) => {
                  toast.success("Chat created!");
                  router.push(`/chat/${chat_id}`);
                },
                onError: (err) => {
                  toast.error("Error creating chat");
                  console.error(err);
                },
              }
            );
          },
          onError: (err) => {
            toast.error("Error uploading pdf");
            console.error(err);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isLoadingCreateChat || isLoadingUploadPdf ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
