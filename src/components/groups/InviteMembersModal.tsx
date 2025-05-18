"use client";

import React, { useState } from "react";
import { Group } from "@/lib/types/models";
import { generateInviteLink } from "@/lib/groups/inviteUtils";
import { sendInviteEmail } from "@/lib/groups/inviteService";

interface InviteMembersModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export default function InviteMembersModal({
  group,
  isOpen,
  onClose,
  onInviteSent,
}: InviteMembersModalProps) {
  const [inviteMethod, setInviteMethod] = useState<"email" | "link" | "qr">(
    "email",
  );
  const [emails, setEmails] = useState<string>("");
  const [message, setMessage] = useState<string>(
    "Join our group on MatchPoint!",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [showCopiedMessage, setShowCopiedMessage] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Update message when group data is available
  React.useEffect(() => {
    if (group && group.sport) {
      setMessage(`Join our ${group.sport} group on MatchPoint!`);
    }
  }, [group]);

  // Generate invite link when modal opens or when group changes
  React.useEffect(() => {
    if (isOpen && group && group.id && group.invitationCode) {
      const link = generateInviteLink(group.id, group.invitationCode);
      setInviteLink(link);
    }
  }, [isOpen, group]);

  const handleEmailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmails(e.target.value);
    setError("");
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const validateEmails = (emailsString: string): boolean => {
    const emailList = emailsString
      .split(/[,;\s]+/)
      .filter((email) => email.trim() !== "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const invalidEmails = emailList.filter(
      (email) => !emailRegex.test(email.trim()),
    );

    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(", ")}`);
      return false;
    }

    if (emailList.length === 0) {
      setError("Please enter at least one email address");
      return false;
    }

    return true;
  };

  const handleSendInvites = async () => {
    if (inviteMethod === "email") {
      if (!validateEmails(emails)) {
        return;
      }

      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        const emailList = emails
          .split(/[,;\s]+/)
          .filter((email) => email.trim() !== "");
        await sendInviteEmail({
          groupId: group.id,
          groupName: group.name,
          inviteLink,
          message,
          emails: emailList,
        });

        setSuccess(`Invitations sent to ${emailList.length} email(s)!`);
        setEmails("");
        onInviteSent();
      } catch (err) {
        setError("Failed to send invitations. Please try again.");
        console.error("Error sending invites:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Invite to {group.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${inviteMethod === "email" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setInviteMethod("email")}
              >
                Email
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${inviteMethod === "link" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setInviteMethod("link")}
              >
                Invite Link
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${inviteMethod === "qr" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setInviteMethod("qr")}
              >
                QR Code
              </button>
            </div>
          </div>

          {inviteMethod === "email" && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="emails"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Addresses <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="emails"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter email addresses separated by commas"
                  value={emails}
                  onChange={handleEmailsChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter multiple emails separated by commas
                </p>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Message
                </label>
                <textarea
                  id="message"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add a personal message to your invitation"
                  value={message}
                  onChange={handleMessageChange}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
                  {success}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSendInvites}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Invites"
                  )}
                </button>
              </div>
            </div>
          )}

          {inviteMethod === "link" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shareable Invite Link
                </label>
                <div className="flex mt-1">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyLinkToClipboard}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {showCopiedMessage ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This link will allow anyone to join your group. It expires in
                  7 days.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Join ${group.name} on MatchPoint`,
                          text: `Join our ${group.sport} group on MatchPoint!`,
                          url: inviteLink,
                        });
                      } else {
                        copyLinkToClipboard();
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    Share
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Join our ${group.sport} group on MatchPoint! ${inviteLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="h-5 w-5 mr-2 text-green-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {inviteMethod === "qr" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  {/* QR code would be generated here - using a placeholder for now */}
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500 text-sm text-center">
                      QR Code for
                      <br />
                      {group.name}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Show this QR code to people you want to invite.
                  <br />
                  They can scan it with their phone camera.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
