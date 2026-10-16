"use client";

import { handleServerActionResponse } from "@/lib/client-utils";
import { sendLoginname } from "@/lib/server/loginname";
import { AtSymbolIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { LoginSettings } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "./alert";
import { AutoSubmitForm } from "./auto-submit-form";
import { Button, ButtonVariants } from "./button";
import { TextInput } from "./input";
import { Spinner } from "./spinner";
import { Translated } from "./translated";

type Inputs = {
  loginName: string;
};

type Props = {
  loginName: string | undefined;
  requestId: string | undefined;
  loginSettings: LoginSettings | undefined;
  organization?: string;
  defaultOrganization?: string;
  suffix?: string;
  hideSuffix?: boolean;
  submit: boolean;
  allowRegister: boolean;
};

export function UsernameForm({
  loginName,
  requestId,
  organization,
  defaultOrganization,
  suffix,
  hideSuffix,
  loginSettings,
  submit,
  allowRegister,
}: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      loginName: loginName ? loginName : "",
    },
  });

  const t = useTranslations("loginname");

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [samlData, setSamlData] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  const submitLoginName = useCallback(
    async (values: Inputs, organization?: string) => {
      setLoading(true);

      try {
        const res = await sendLoginname({
          loginName: values.loginName,
          organization,
          defaultOrganization,
          requestId,
          suffix,
        });

        handleServerActionResponse(res, router, setSamlData, setError);
        return res;
      } catch {
        setError(t("errors.internalError"));
      } finally {
        setLoading(false);
      }
    },
    [defaultOrganization, requestId, suffix, router, t],
  );

  useEffect(() => {
    if (submit && loginName) {
      // When we navigate to this page, we always want to be redirected if submit is true and the parameters are valid.
      submitLoginName({ loginName }, organization);
    }
  }, [submit, loginName, organization, submitLoginName]);

  let inputLabel = t("labels.loginname");
  if (loginSettings?.disableLoginWithEmail && loginSettings?.disableLoginWithPhone) {
    inputLabel = t("labels.username");
  } else if (loginSettings?.disableLoginWithEmail) {
    inputLabel = t("labels.usernameOrPhoneNumber");
  } else if (loginSettings?.disableLoginWithPhone) {
    inputLabel = t("labels.usernameOrEmail");
  }

  return (
    <>
      {samlData && <AutoSubmitForm url={samlData.url} fields={samlData.fields} />}
      <form className="w-full">
        <div className="">
          <TextInput
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            {...register("loginName", { required: t("required.loginName") })}
            label={inputLabel}
            placeholder="you@labxgame.com"
            prefixIcon={<AtSymbolIcon className="h-4 w-4" />}
            data-testid="username-text-input"
            suffix={hideSuffix ? undefined : suffix}
          />
        </div>

        {error && (
          <div className="py-4" data-testid="error">
            <Alert>{error}</Alert>
          </div>
        )}
        <div className="mt-4 w-full">
          <Button
            data-testid="submit-button"
            type="submit"
            className="!h-11 w-full justify-center text-[15px]"
            variant={ButtonVariants.Primary}
            disabled={loading || !formState.isValid}
            onClick={handleSubmit((e) => submitLoginName(e, organization))}
          >
            {loading && <Spinner className="mr-2 h-5 w-5" />}
            <Translated i18nKey="submit" namespace="loginname" />
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {allowRegister && (
          <p className="pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            New here?{" "}
            <button
              className="font-medium text-primary-light-500 transition-all hover:underline dark:text-primary-dark-500"
              onClick={() => {
                const registerParams = new URLSearchParams();
                if (organization) {
                  registerParams.append("organization", organization);
                }
                if (requestId) {
                  registerParams.append("requestId", requestId);
                }

                router.push("/register?" + registerParams);
              }}
              type="button"
              disabled={loading}
              data-testid="register-button"
            >
              <Translated i18nKey="register" namespace="loginname" />
            </button>
          </p>
        )}
      </form>
    </>
  );
}
